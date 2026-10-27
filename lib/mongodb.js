const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://piyushteam68_db_user:Fgy1EXXRoLRdx1oh@cluster0.ft0p5f5.mongodb.net/hotel_simran?retryWrites=true&w=majority';
const DB_NAME = 'hotel_simran';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB Atlas with connection caching for serverless environments.
 */
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase, MONGODB_URI, DB_NAME };
