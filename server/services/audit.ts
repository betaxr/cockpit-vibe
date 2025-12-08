import { Collection } from "mongodb";
import { getMongoDb } from "../_core/mongo";
import { logger } from "../_core/ops";

type AuditEntry = {
  action: string;
  actor: { id: string; role?: string | null };
  tenantId: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

async function getAuditCollection(): Promise<Collection<AuditEntry> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<AuditEntry>("audit_logs");
}

export async function logAudit(entry: Omit<AuditEntry, "timestamp">) {
  const doc: AuditEntry = { ...entry, timestamp: new Date().toISOString() };
  try {
    const col = await getAuditCollection();
    if (col) {
      await col.insertOne(doc);
    } else {
      logger.info("Audit (no DB)", doc);
    }
  } catch (err) {
    logger.error({ err, action: entry.action }, "Failed to write audit log");
  }
}
