import mongoose from 'mongoose';

async function checkUsers() {
  await mongoose.connect('mongodb://Ranbhoomi_db:Pass_Ranbhoomi@ac-0zqvvsw-shard-00-00.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-01.ojvx8ud.mongodb.net:27017,ac-0zqvvsw-shard-00-02.ojvx8ud.mongodb.net:27017/Ranbhoomi?ssl=true&replicaSet=atlas-33udbq-shard-0&authSource=admin&retryWrites=true&w=majority');
  
  const adminUserSchema = new mongoose.Schema({}, { strict: false, collection: 'adminusers' });
  const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
  
  const users = await AdminUser.find({});
  console.log("Total Admin Users:", users.length);
  for (let u of users) {
    console.log(JSON.stringify(u.toObject(), null, 2));
  }
  
  process.exit(0);
}

checkUsers();
