import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("FATAL: MONGODB_URI environment variable is required in production.");
    }
    // If no URI in dev, default to local mocked DB
    global.isDbMocked = true;
    return mongoose;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    global.isDbMocked = false;
    return cached.conn;
  }

  if (global.isDbMocked && process.env.NODE_ENV !== 'production') {
    return mongoose;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 10000 : 1500,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      global.isDbMocked = false;
      return mongoose;
    }).catch(err => {
      cached.promise = null;
      if (process.env.NODE_ENV !== 'production') {
        global.isDbMocked = true;
      }
      throw err;
    });
  }
  
  try {
    const timeoutDuration = process.env.NODE_ENV === 'production' ? 12000 : 1600;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection timeout")), timeoutDuration)
    );
    cached.conn = await Promise.race([cached.promise, timeoutPromise]);
    global.isDbMocked = false;
  } catch (e) {
    cached.promise = null;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`MongoDB connection error: ${e.message}`);
    }
    console.warn("MongoDB Atlas connection failed. Falling back to local file-based database.");
    global.isDbMocked = true;
    return mongoose;
  }

  return cached.conn;
}

export default connectToDatabase;
