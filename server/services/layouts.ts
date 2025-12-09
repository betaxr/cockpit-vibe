import { Collection } from "mongodb";
import { getMongoDb } from "../_core/mongo";

export type LayoutDoc = {
  tenantId: string;
  userId: string;
  page: string;
  positions: unknown;
  updatedAt: Date;
};

async function getLayoutsCollection(): Promise<Collection<LayoutDoc>> {
  const db = await getMongoDb();
  if (!db) {
    throw new Error("MongoDB not configured");
  }
  const col = db.collection<LayoutDoc>("layouts");
  await col.createIndex({ tenantId: 1, userId: 1, page: 1 }, { unique: true });
  return col;
}

export async function getLayout(tenantId: string, userId: string, page: string) {
  const col = await getLayoutsCollection();
  return col.findOne({ tenantId, userId, page });
}

export async function upsertLayout(tenantId: string, userId: string, page: string, positions: unknown) {
  const col = await getLayoutsCollection();
  await col.updateOne(
    { tenantId, userId, page },
    { $set: { positions, updatedAt: new Date() } },
    { upsert: true }
  );
}
