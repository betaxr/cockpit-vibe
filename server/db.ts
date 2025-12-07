import { eq, desc } from "drizzle-orm";
/**
 * @fileoverview Database Operations for Cockpit Vibe
 * 
 * This module provides all database operations using Drizzle ORM.
 * It handles user management, database connections, teams, agents,
 * workspaces, processes, schedules, and cortex entries.
 * 
 * **Security Features:**
 * - Password encryption using AES-256-CBC
 * - Lazy database connection initialization
 * - Graceful handling when database is unavailable
 * 
 * @module server/db
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

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


// ============ Teams ============

import { teams, agents, workspaces, processes, scheduleEntries, cortexEntries, InsertTeam, InsertAgent, InsertWorkspace, InsertProcess, InsertScheduleEntry, InsertCortexEntry } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).orderBy(desc(teams.createdAt));
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}

export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values(data);
  return result[0].insertId;
}

export async function updateTeam(id: number, data: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teams).set(data).where(eq(teams.id, id));
}

// ============ Agents ============

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result[0];
}

export async function getAgentWithTeam(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const agent = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  if (!agent[0]) return undefined;
  
  let team = null;
  if (agent[0].teamId) {
    const teamResult = await db.select().from(teams).where(eq(teams.id, agent[0].teamId)).limit(1);
    team = teamResult[0] || null;
  }
  
  return { ...agent[0], team };
}

export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(agents).values(data);
  return result[0].insertId;
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(agents).where(eq(agents.id, id));
}

// ============ Workspaces ============

export async function getAllWorkspaces() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
}

export async function getWorkspacesByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workspaces).where(eq(workspaces.agentId, agentId));
}

export async function createWorkspace(data: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workspaces).values(data);
  return result[0].insertId;
}

export async function updateWorkspace(id: number, data: Partial<InsertWorkspace>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(workspaces).set(data).where(eq(workspaces.id, id));
}

// ============ Processes ============

export async function getAllProcesses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(processes).orderBy(desc(processes.createdAt));
}

export async function getProcessesByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(processes).where(eq(processes.agentId, agentId));
}

export async function createProcess(data: InsertProcess) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(processes).values(data);
  return result[0].insertId;
}

export async function updateProcess(id: number, data: Partial<InsertProcess>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(processes).set(data).where(eq(processes.id, id));
}

// ============ Schedule ============

export async function getScheduleByAgentAndDate(agentId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduleEntries)
    .where(sql`${scheduleEntries.agentId} = ${agentId} AND ${scheduleEntries.date} = ${date}`)
    .orderBy(scheduleEntries.startHour);
}

export async function createScheduleEntry(data: InsertScheduleEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scheduleEntries).values(data);
  return result[0].insertId;
}

// ============ Cortex ============

export async function getAllCortexEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cortexEntries).orderBy(desc(cortexEntries.createdAt));
}

export async function createCortexEntry(data: InsertCortexEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cortexEntries).values(data);
  return result[0].insertId;
}

// ============ Statistics ============

export async function getGlobalStats() {
  const db = await getDb();
  if (!db) return { processCount: 0, valueGenerated: 0, timeSaved: 0, utilization: 0 };
  
  const processStats = await db.select({
    count: sql<number>`COUNT(*)`,
    totalValue: sql<number>`COALESCE(SUM(${processes.valueGenerated}), 0)`,
    totalTimeSaved: sql<number>`COALESCE(SUM(${processes.timeSavedMinutes}), 0)`,
  }).from(processes);
  
  const agentStats = await db.select({
    count: sql<number>`COUNT(*)`,
    activeCount: sql<number>`SUM(CASE WHEN ${agents.status} = 'active' OR ${agents.status} = 'busy' THEN 1 ELSE 0 END)`,
  }).from(agents);
  
  const stats = processStats[0] || { count: 0, totalValue: 0, totalTimeSaved: 0 };
  const agentData = agentStats[0] || { count: 0, activeCount: 0 };
  
  const utilization = agentData.count > 0 
    ? Math.round((Number(agentData.activeCount) / Number(agentData.count)) * 100) 
    : 0;
  
  return {
    processCount: Number(stats.count),
    valueGenerated: Number(stats.totalValue) / 100, // Convert cents to euros
    timeSaved: Math.round(Number(stats.totalTimeSaved) / 60), // Convert minutes to hours
    utilization,
  };
}
