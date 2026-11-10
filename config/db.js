const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("booknook");
    await db.command({ ping: 1 });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error("Database not connected yet");
  return db;
};

module.exports = { connectDB, getDB };
