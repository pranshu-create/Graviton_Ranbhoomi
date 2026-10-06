import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const MOCK_DB_PATH = path.resolve(process.cwd(), 'db_mock.json');

// Helper to seed default data
async function seedDefaultData() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const salt = await bcrypt.genSalt(10);
    const defaultData = {
      adminusers: [
        {
          _id: "mock-super-admin-id",
          name: "Pranshu",
          email: "pranshu@graviton.in",
          password: await bcrypt.hash("Pranshu@671", salt),
          role: "SUPER_ADMIN",
          twoFactorEnabled: false
        },
        {
          _id: "mock-hostel-authority-id",
          name: "Hostel Authority",
          email: "hostelauthority@graviton.in",
          password: await bcrypt.hash("hostelauthority123", salt),
          role: "HOSTEL_AUTHORITY",
          twoFactorEnabled: false
        },
        {
          _id: "mock-boys-hostel-security-id",
          name: "Boys Hostel Security",
          email: "boyshostelsecurity@graviton.in",
          password: await bcrypt.hash("boyshostelsecurity123", salt),
          role: "BOYS_HOSTEL_SECURITY",
          twoFactorEnabled: false
        },
        {
          _id: "mock-girls-hostel-security-id",
          name: "Girls Hostel Security",
          email: "girlshostelsecurity@graviton.in",
          password: await bcrypt.hash("girlshostelsecurity123", salt),
          role: "GIRLS_HOSTEL_SECURITY",
          twoFactorEnabled: false
        }
      ]
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

function matchesQuery(item, queryConditions) {
  if (!queryConditions) return true;
  for (const key in queryConditions) {
    const val = queryConditions[key];
    
    let itemVal = item[key];
    if (itemVal && itemVal.toString) itemVal = itemVal.toString();
    
    let compareVal = val;
    if (compareVal && compareVal.toString && typeof compareVal !== 'string' && !(compareVal instanceof RegExp)) {
      compareVal = compareVal.toString();
    }

    if (val && typeof val === 'object' && !(val instanceof RegExp) && !(val instanceof Date)) {
      for (const op in val) {
        if (op === '$ne') {
          let opVal = val[op];
          if (opVal && opVal.toString) opVal = opVal.toString();
          if (itemVal === opVal) return false;
        } else if (op === '$in') {
          const list = val[op].map(x => x && x.toString ? x.toString() : x);
          if (!list.includes(itemVal)) return false;
        } else if (op === '$regex') {
          const regex = new RegExp(val[op], val['$options'] || '');
          if (!regex.test(itemVal)) return false;
        }
      }
    } else if (val instanceof RegExp) {
      if (!val.test(itemVal)) return false;
    } else {
      if (itemVal !== compareVal) return false;
    }
  }
  return true;
}

// Intercept readyState at connection level to prevent buffering errors
Object.defineProperty(mongoose.Connection.prototype, 'readyState', {
  get() {
    return 1; // Always connected
  },
  set(val) {
    this._readyState = val;
  },
  configurable: true
});

// Helper to check if a connection is offline
function isConnectionOffline(conn) {
  return conn._readyState !== 1;
}

// Save original Collection methods
const originalInsertOne = mongoose.Collection.prototype.insertOne;
const originalInsertMany = mongoose.Collection.prototype.insertMany;
const originalFind = mongoose.Collection.prototype.find;
const originalFindOne = mongoose.Collection.prototype.findOne;
const originalUpdateOne = mongoose.Collection.prototype.updateOne;
const originalUpdateMany = mongoose.Collection.prototype.updateMany;
const originalDeleteOne = mongoose.Collection.prototype.deleteOne;
const originalDeleteMany = mongoose.Collection.prototype.deleteMany;
const originalCountDocuments = mongoose.Collection.prototype.countDocuments;
const originalFindOneAndUpdate = mongoose.Collection.prototype.findOneAndUpdate;

// Override Collection prototype methods to route to JSON mock if offline
mongoose.Collection.prototype.insertOne = async function(doc, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    if (!dbData[name]) dbData[name] = [];
    if (!doc._id) {
      doc._id = new mongoose.Types.ObjectId().toString();
    }
    dbData[name].push(doc);
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    return { insertedId: doc._id, acknowledged: true };
  }
  return originalInsertOne.apply(this, arguments);
};

mongoose.Collection.prototype.insertMany = async function(docs, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    if (!dbData[name]) dbData[name] = [];
    const insertedIds = {};
    docs.forEach((doc, idx) => {
      if (!doc._id) {
        doc._id = new mongoose.Types.ObjectId().toString();
      }
      insertedIds[idx] = doc._id;
      dbData[name].push(doc);
    });
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    return { insertedCount: docs.length, insertedIds, acknowledged: true };
  }
  return originalInsertMany.apply(this, arguments);
};

mongoose.Collection.prototype.find = function(query, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const results = collection.filter(item => matchesQuery(item, query));
    
    return {
      toArray: async () => results,
      forEach: async (fn) => results.forEach(fn),
      limit: function() { return this; },
      sort: function() { return this; },
      skip: function() { return this; }
    };
  }
  return originalFind.apply(this, arguments);
};

mongoose.Collection.prototype.findOne = async function(query, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const result = collection.find(item => matchesQuery(item, query));
    return result || null;
  }
  return originalFindOne.apply(this, arguments);
};

mongoose.Collection.prototype.updateOne = async function(query, update, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const index = collection.findIndex(item => matchesQuery(item, query));
    let modifiedCount = 0;
    
    if (index !== -1) {
      const item = collection[index];
      if (update.$set) {
        Object.assign(item, update.$set);
      } else if (update.$unset) {
        for (const key in update.$unset) {
          delete item[key];
        }
      } else {
        Object.assign(item, update);
      }
      dbData[name][index] = item;
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
      modifiedCount = 1;
    } else if (options && options.upsert) {
      const newItem = { ...query };
      if (update.$set) {
        Object.assign(newItem, update.$set);
      } else {
        Object.assign(newItem, update);
      }
      if (!newItem._id) {
        newItem._id = new mongoose.Types.ObjectId().toString();
      }
      dbData[name].push(newItem);
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
      modifiedCount = 1;
    }
    return { matchedCount: index !== -1 ? 1 : 0, modifiedCount, acknowledged: true };
  }
  return originalUpdateOne.apply(this, arguments);
};

mongoose.Collection.prototype.updateMany = async function(query, update, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    let modifiedCount = 0;
    
    collection.forEach((item, index) => {
      if (matchesQuery(item, query)) {
        if (update.$set) {
          Object.assign(item, update.$set);
        } else {
          Object.assign(item, update);
        }
        dbData[name][index] = item;
        modifiedCount++;
      }
    });
    
    if (modifiedCount > 0) {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    }
    return { matchedCount: modifiedCount, modifiedCount, acknowledged: true };
  }
  return originalUpdateMany.apply(this, arguments);
};

mongoose.Collection.prototype.deleteOne = async function(query, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const index = collection.findIndex(item => matchesQuery(item, query));
    let deletedCount = 0;
    if (index !== -1) {
      collection.splice(index, 1);
      dbData[name] = collection;
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
      deletedCount = 1;
    }
    return { deletedCount, acknowledged: true };
  }
  return originalDeleteOne.apply(this, arguments);
};

mongoose.Collection.prototype.deleteMany = async function(query, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const remaining = collection.filter(item => !matchesQuery(item, query));
    const deletedCount = collection.length - remaining.length;
    dbData[name] = remaining;
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    return { deletedCount, acknowledged: true };
  }
  return originalDeleteMany.apply(this, arguments);
};

mongoose.Collection.prototype.countDocuments = async function(query, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    return collection.filter(item => matchesQuery(item, query)).length;
  }
  return originalCountDocuments.apply(this, arguments);
};

mongoose.Collection.prototype.findOneAndUpdate = async function(query, update, options) {
  if (isConnectionOffline(this.conn)) {
    const name = this.name.toLowerCase();
    await seedDefaultData();
    let dbData = {};
    try {
      dbData = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    } catch (e) {}
    const collection = dbData[name] || [];
    const index = collection.findIndex(item => matchesQuery(item, query));
    
    if (index !== -1) {
      const item = collection[index];
      if (update.$set) {
        Object.assign(item, update.$set);
      } else {
        Object.assign(item, update);
      }
      dbData[name][index] = item;
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
      return { value: item };
    }
    return { value: null };
  }
  return originalFindOneAndUpdate.apply(this, arguments);
};
