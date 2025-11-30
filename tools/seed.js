const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

function mapData(_data) {
  return _data.map((item) => {
    return Object.entries(item).reduce((acc, [key, value]) => {
      if (key === '_id' && value?.$oid) {
        acc[key] = new ObjectId(value.$oid);
      } else if (value?.$oid) {
        acc[key] = new ObjectId(value.$oid);
      } else if (value?.$date) {
        acc[key] = new Date(value.$date);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  });
}

async function processFile(filePath, mode, db) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const seed = JSON.parse(raw);
  const seedData = mapData(seed.data);
  const collection = db.collection(seed.collection);
  if (mode === 'prune') {
    await collection.deleteMany({});
    if (seedData.length > 0) {
      await collection.insertMany(seedData);
    }
    console.log(`Pruned ${seed.collection} collection`);
  } else if (mode === 'migrate') {
    for (const doc of seedData) {
      const exists = await collection.findOne(doc);
      if (!exists) {
        await collection.insertOne(doc);
        console.log(`Inserted ${doc._id} into ${seed.collection} collection`);
      }
    }
    console.log(`done`);
  } else {
    console.error('Please provide a valid mode');
  }
}
async function boostrap() {
  const dirPath = process.argv[2];
  const mode = process.argv[3] || 'migrate';
  if (!dirPath) {
    console.error('Please provide a directory path');
    process.exit(1);
  }
  const absoluteDir = path.resolve(dirPath);
  if (!fs.existsSync(absoluteDir)) {
    console.error('Please provide a valid directory path');
    process.exit(1);
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME || 'invoice_app');
    const files = fs
      .readdirSync(absoluteDir)
      .filter((file) => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(absoluteDir, file);
      await processFile(filePath, mode, db);
    }
    console.log('Done');
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

boostrap();
