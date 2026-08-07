import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../.env.local");

try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1].trim()] = val;
    }
  });
} catch (err) {
  console.warn("Could not load .env.local manually:", err.message);
}

const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// Define inline schema to avoid module resolution path errors
const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }
});

const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const teams = await Team.find({});
    console.log(`Found ${teams.length} total teams.`);

    let migrateCount = 0;
    const bcryptRegex = /^\$2[ayb]\$.{56}$/;

    for (let team of teams) {
      if (!bcryptRegex.test(team.password)) {
        console.log(`Hashing password for team: ${team.name} (ID: ${team.teamId})`);
        const salt = await bcrypt.genSalt(10);
        team.password = await bcrypt.hash(team.password, salt);
        await Team.updateOne({ _id: team._id }, { password: team.password });
        migrateCount++;
      }
    }

    console.log(`Migration complete. Hashed ${migrateCount} plaintext team passwords.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
