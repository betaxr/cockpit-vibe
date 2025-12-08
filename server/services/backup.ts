import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { getMongoDb } from "../_core/mongo";
import { logger } from "../_core/ops";

const bucket = process.env.BACKUP_BUCKET;
const prefix = process.env.BACKUP_PREFIX || "backups";
const region = process.env.AWS_REGION || "eu-central-1";

const s3 = bucket ? new S3Client({ region }) : null;

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function backupAuditLogs(): Promise<string | null> {
  if (!s3 || !bucket) {
    logger.warn("[Backup] S3 bucket not configured; skipping audit backup");
    return null;
  }

  const db = await getMongoDb();
  if (!db) {
    logger.warn("[Backup] MongoDB not configured; skipping audit backup");
    return null;
  }

  const docs = await db.collection("audit_logs").find().toArray();
  const key = `${prefix}/audit-${new Date().toISOString()}.json`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(docs),
    ContentType: "application/json",
  }));

  logger.info({ key, count: docs.length }, "[Backup] Audit logs archived to S3");
  return key;
}

export async function restoreAuditLogs(key: string): Promise<number> {
  if (!s3 || !bucket) {
    logger.warn("[Backup] S3 bucket not configured; cannot restore audit logs");
    return 0;
  }

  const db = await getMongoDb();
  if (!db) {
    logger.warn("[Backup] MongoDB not configured; cannot restore audit logs");
    return 0;
  }

  const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!result.Body) return 0;
  const body = await streamToString(result.Body as Readable);
  const docs = JSON.parse(body);
  if (!Array.isArray(docs)) return 0;

  const col = db.collection("audit_logs");
  await col.insertMany(docs);
  logger.info({ key, count: docs.length }, "[Backup] Audit logs restored from S3");
  return docs.length;
}
