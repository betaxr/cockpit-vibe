import { MongoClient, Db } from "mongodb";
import { ENV } from "./env";

let client: MongoClient | null = null;
let db: Db | null = null;

export function isMongoConfigured() {
  return Boolean(process.env.MONGO_URI);
}

export async function getMongoDb(): Promise<Db | null> {
  if (!process.env.MONGO_URI || !ENV.mongoDbName) {
    return null;
  }

  if (db) return db;

  try {
    client = new MongoClient(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    await client.connect();
    db = client.db(ENV.mongoDbName);
    return db;
  } catch (err) {
    console.error("[Mongo] Failed to connect:", err);
    client = null;
    db = null;
    return null;
  }
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
