import mongoose from "mongoose";
import { readFileSync } from "fs";

// Manually parse .env.local
const envFile = readFileSync(".env.local", "utf8");
const uriLine = envFile.split('\n').find(line => line.startsWith("MONGODB_URI"));
const MONGODB_URI = uriLine ? uriLine.substring(uriLine.indexOf('=') + 1).replace(/"/g, '').replace(/\r/g, '').trim() : '';

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  fees: { type: String },
  teamSizeMin: { type: Number, default: 1 },
  teamSizeMax: { type: Number, default: 4 },
  prize: { type: String },
  date: { type: Date },
  status: { type: String, enum: ["UPCOMING", "ONGOING", "COMPLETED"], default: "UPCOMING" }
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

const eventsData = [
  { name: "ROBO RACE", description: "Navigate a customized obstacle course in the shortest time.", fees: "₹500 / Team", teamSizeMin: 1, teamSizeMax: 4, prize: "₹20,000", status: "UPCOMING" },
  { name: "ROBO SOCCER", description: "A thrilling battle of manually controlled bots pushing the ball into the opponent's goal.", fees: "₹500 / Team", teamSizeMin: 1, teamSizeMax: 4, prize: "₹20,000", status: "UPCOMING" },
  { name: "LINE FOLLOWER", description: "Test your programming and sensor calibration skills!", fees: "₹600", teamSizeMin: 1, teamSizeMax: 3, prize: "₹20,000", status: "UPCOMING" },
  { name: "ROBO SUMO", description: "The ultimate test of mechanical design and pushing power.", fees: "₹500 / Team", teamSizeMin: 1, teamSizeMax: 4, prize: "₹25,000", status: "UPCOMING" },
  { name: "HACKATHON", description: "Solve real-world problems using cutting-edge technology in 24 hours.", fees: "₹800 / Team", teamSizeMin: 2, teamSizeMax: 4, prize: "₹50,000", status: "UPCOMING" }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    await Event.deleteMany({});
    console.log("Cleared existing events.");
    
    await Event.insertMany(eventsData);
    console.log("Seeded new events successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exit(1);
  }
}

seed();
