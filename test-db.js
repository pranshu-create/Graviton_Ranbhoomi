import mongoose from "mongoose";

const uri = "mongodb://Ranbhoomi_db:Pass_Ranbhoomi@ac-0zqvvsw-shard-00-00.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-01.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-02.ojvx8ud.mongodb.net:27017/Ranbhoomi?ssl=true&replicaSet=atlas-33udbq-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}
test();
