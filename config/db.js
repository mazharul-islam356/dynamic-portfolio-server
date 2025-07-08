const { MongoClient } = require("mongodb");
let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("portfolioDB");
  console.log("✅ MongoDB Connected");
}

function getDB() {
  if (!db) throw new Error("DB not connected");
  return db;
}

module.exports = { connectDB, getDB };
