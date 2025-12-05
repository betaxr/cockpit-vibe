import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, databaseConnections, connectionLogs, InsertDatabaseConnection, InsertConnectionLog } from "../drizzle/schema";
import crypto from "crypto";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Database Connections ============

// Simple encryption for passwords (in production, use a proper secrets manager)
const ENCRYPTION_KEY = process.env.JWT_SECRET?.slice(0, 32).padEnd(32, '0') || 'default-key-for-dev-only!!!!!!!!';
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return '';
  }
}

export async function createDatabaseConnection(data: Omit<InsertDatabaseConnection, 'encryptedPassword'> & { password?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: InsertDatabaseConnection = {
    ...data,
    encryptedPassword: data.password ? encrypt(data.password) : null,
  };

  const result = await db.insert(databaseConnections).values(values);
  return result[0].insertId;
}

export async function updateDatabaseConnection(id: number, data: Partial<Omit<InsertDatabaseConnection, 'encryptedPassword'>> & { password?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Partial<InsertDatabaseConnection> = { ...data };
  if (data.password) {
    updateData.encryptedPassword = encrypt(data.password);
  }
  delete (updateData as Record<string, unknown>).password;

  await db.update(databaseConnections).set(updateData).where(eq(databaseConnections.id, id));
}

export async function deleteDatabaseConnection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(databaseConnections).where(eq(databaseConnections.id, id));
}

export async function getDatabaseConnectionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(databaseConnections).where(eq(databaseConnections.id, id)).limit(1);
  return result[0];
}

export async function getAllDatabaseConnections() {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: databaseConnections.id,
    name: databaseConnections.name,
    dbType: databaseConnections.dbType,
    host: databaseConnections.host,
    port: databaseConnections.port,
    database: databaseConnections.database,
    username: databaseConnections.username,
    sslEnabled: databaseConnections.sslEnabled,
    status: databaseConnections.status,
    lastConnectedAt: databaseConnections.lastConnectedAt,
    lastError: databaseConnections.lastError,
    createdById: databaseConnections.createdById,
    createdAt: databaseConnections.createdAt,
    updatedAt: databaseConnections.updatedAt,
  }).from(databaseConnections).orderBy(desc(databaseConnections.createdAt));
}

export async function getDecryptedPassword(id: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({ encryptedPassword: databaseConnections.encryptedPassword })
    .from(databaseConnections)
    .where(eq(databaseConnections.id, id))
    .limit(1);

  if (!result[0]?.encryptedPassword) return null;
  return decrypt(result[0].encryptedPassword);
}

export async function updateConnectionStatus(id: number, status: 'active' | 'inactive' | 'error' | 'unknown', error?: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(databaseConnections).set({
    status,
    lastConnectedAt: status === 'active' ? new Date() : undefined,
    lastError: error || null,
  }).where(eq(databaseConnections.id, id));
}

// ============ Connection Logs ============

export async function logConnectionAction(data: InsertConnectionLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(connectionLogs).values(data);
}

export async function getConnectionLogs(connectionId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(connectionLogs)
    .where(eq(connectionLogs.connectionId, connectionId))
    .orderBy(desc(connectionLogs.createdAt))
    .limit(limit);
}
