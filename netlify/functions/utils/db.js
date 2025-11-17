const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  await client.connect();
  const db = client.db('bloomnet');
  
  cachedClient = client;
  cachedDb = db;
  
  return db;
}

module.exports = { connectToDatabase };
