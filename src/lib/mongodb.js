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
    // If no URI, default to local mocked DB
    global.isDbMocked = true;
    return mongoose;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    global.isDbMocked = false;
    return cached.conn;
  }

  if (global.isDbMocked) {
    return mongoose;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // 1.5s timeout for fast offline fallback
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      global.isDbMocked = false;
      return mongoose;
    }).catch(err => {
      cached.promise = null;
      global.isDbMocked = true;
      throw err;
    });
  }
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection timeout")), 1600)
    );
    cached.conn = await Promise.race([cached.promise, timeoutPromise]);
    global.isDbMocked = false;
  } catch (e) {
    cached.promise = null;
    console.warn("MongoDB Atlas connection failed. Falling back to local file-based database.");
    global.isDbMocked = true;
    return mongoose; // Return mongoose anyway to prevent undefined reference crashes
  }

  return cached.conn;
}

export default connectToDatabase;
