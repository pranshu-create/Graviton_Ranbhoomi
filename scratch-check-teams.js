import mongoose from 'mongoose';

async function check() {
  await mongoose.connect('mongodb://Ranbhoomi_db:Pass_Ranbhoomi@ac-0zqvvsw-shard-00-00.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-01.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-02.ojvx8ud.mongodb.net:27017/Ranbhoomi?ssl=true&replicaSet=atlas-33udbq-shard-0&authSource=admin&retryWrites=true&w=majority');
  
  const Team = mongoose.models.Team || mongoose.model("Team", new mongoose.Schema({}, { strict: false }));
  const Accommodation = mongoose.models.Accommodation || mongoose.model("Accommodation", new mongoose.Schema({}, { strict: false }));

  const teams = await Team.find({});
  console.log("Total Teams:", teams.length);
  for (let t of teams) {
    console.log(`- Team: ${t.name} (${t.teamId}) - Event: ${t.event} - Status: ${t.status}`);
  }

  const accs = await Accommodation.find({});
  console.log("\nTotal Accommodations:", accs.length);
  for (let a of accs) {
    console.log(`- Member: ${a.memberName} (${a.gender}) - Team: ${a.teamName} - Status: ${a.status} - CheckedIn: ${a.isCheckedIn}`);
  }
  
  process.exit(0);
}

check().catch(console.error);
