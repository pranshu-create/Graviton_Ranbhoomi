import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

// Models
const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "VOLUNTEER" }
}, { timestamps: true });

const TeamSchema = new mongoose.Schema({}, { strict: false });
const AccommodationSchema = new mongoose.Schema({}, { strict: false });
const LogSchema = new mongoose.Schema({}, { strict: false });
const ExpenseSchema = new mongoose.Schema({}, { strict: false });
const SponsorSchema = new mongoose.Schema({}, { strict: false });
const SystemConfigSchema = new mongoose.Schema({}, { strict: false });

async function resetDb() {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
    const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
    const Accommodation = mongoose.models.Accommodation || mongoose.model("Accommodation", AccommodationSchema);
    const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);
    const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
    const Sponsor = mongoose.models.Sponsor || mongoose.model("Sponsor", SponsorSchema);
    const SystemConfig = mongoose.models.SystemConfig || mongoose.model("SystemConfig", SystemConfigSchema);

    console.log("Starting PURGE sequence...");

    await Team.deleteMany({});
    console.log("✅ Wiped all Teams");

    await Accommodation.deleteMany({});
    console.log("✅ Wiped all Accommodations");

    await Log.deleteMany({});
    console.log("✅ Wiped all System Logs");

    await Expense.deleteMany({});
    console.log("✅ Wiped all Expenses");

    await Sponsor.deleteMany({});
    console.log("✅ Wiped all Sponsors");

    await SystemConfig.deleteMany({});
    await SystemConfig.create({
      configId: "global",
      eventsFrozen: [],
      isEventFreezeGlobal: false,
      activeEvents: []
    });
    console.log("✅ Reset System Config");

    await AdminUser.deleteMany({ email: { $ne: "pranshu@graviton.in" } });
    console.log("✅ Purged AdminUsers (Kept pranshu@graviton.in)");

    const salt = await bcrypt.genSalt(10);
    
    const pranshuExists = await AdminUser.findOne({ email: "pranshu@graviton.in" });
    if (!pranshuExists) {
        console.warn("⚠️ Warning: 'pranshu@graviton.in' admin user not found in DB! Please create it manually if needed.");
    }

    const defaultUsers = [
      { name: "Hostel Authority", email: "hostelauthority@graviton.in", password: await bcrypt.hash("hostelauthority123", salt), role: "HOSTEL_AUTHORITY" },
      { name: "Boys Hostel Security", email: "boyshostelsecurity@graviton.in", password: await bcrypt.hash("boyshostelsecurity123", salt), role: "BOYS_HOSTEL_SECURITY" },
      { name: "Girls Hostel Security", email: "girlshostelsecurity@graviton.in", password: await bcrypt.hash("girlshostelsecurity123", salt), role: "GIRLS_HOSTEL_SECURITY" },
    ];

    for (const u of defaultUsers) {
      await AdminUser.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }
    console.log("✅ Seeded default Hostel Authority / Security accounts");

    console.log("\n🚀 DB PURGE & RESET COMPLETE 🚀");
    process.exit(0);

  } catch (error) {
    console.error("Error resetting DB:", error);
    process.exit(1);
  }
}

resetDb();
