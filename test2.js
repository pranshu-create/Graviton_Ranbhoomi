import mongoose from "mongoose";

const uri = "mongodb://Ranbhoomi_db:Pass_Ranbhoomi@ac-0zqvvsw-shard-00-00.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-01.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-02.ojvx8ud.mongodb.net:27017/Ranbhoomi?ssl=true&replicaSet=atlas-33udbq-shard-0&authSource=admin&retryWrites=true&w=majority";

const TeamSchema = new mongoose.Schema({}, { strict: false });
const Team = mongoose.model("Team", TeamSchema);

async function reset() {
  try {
    await mongoose.connect(uri);
    const hackedTeams = await Team.find({ hasHackedMainframe: true });
    
    console.log(`Found ${hackedTeams.length} hacked teams. Resetting all but one per email...`);
    
    const emailMap = new Set();
    
    for (const team of hackedTeams) {
      const email = team.memberDetails?.[0]?.email;
      if (!emailMap.has(email)) {
        // Keep the first one
        emailMap.add(email);
        console.log(`Keeping hack for ${email}`);
      } else {
        // Reset the others
        await Team.updateOne({ _id: team._id }, { $set: { hasHackedMainframe: false } });
        console.log(`Reset hack for duplicate team of ${email}`);
      }
    }
    
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
reset();
