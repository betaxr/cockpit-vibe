import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Teams table - groups of agents
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: varchar("teamId", { length: 64 }).notNull().unique(),
  region: varchar("region", { length: 128 }),
  customerType: varchar("customerType", { length: 128 }),
  project: varchar("project", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Agents table - AI agents or team members
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  teamId: int("teamId"),
  hoursPerDay: int("hoursPerDay").default(24).notNull(),
  status: mysqlEnum("status", ["active", "idle", "offline", "busy"]).default("idle").notNull(),
  avatarColor: varchar("avatarColor", { length: 32 }).default("#f97316"),
  skills: text("skills"), // JSON array of skills
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Workspaces/Installations table - where agents work
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["pc", "vm", "server", "cloud"]).default("pc").notNull(),
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline").notNull(),
  agentId: int("agentId"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  lastActiveAt: timestamp("lastActiveAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

// Processes table - tasks/processes that agents execute
export const processes = mysqlTable("processes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "paused"]).default("pending").notNull(),
  agentId: int("agentId"),
  workspaceId: int("workspaceId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  durationMinutes: int("durationMinutes"),
  valueGenerated: int("valueGenerated").default(0), // in cents
  timeSavedMinutes: int("timeSavedMinutes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Process = typeof processes.$inferSelect;
export type InsertProcess = typeof processes.$inferInsert;

// Schedule table - daily schedule entries for agents
export const scheduleEntries = mysqlTable("schedule_entries", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  processId: int("processId"),
  title: varchar("title", { length: 255 }).notNull(),
  date: date("date").notNull(),
  startHour: int("startHour").notNull(), // 0-23
  endHour: int("endHour").notNull(), // 0-23
  color: varchar("color", { length: 32 }).default("#f97316"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = typeof scheduleEntries.$inferInsert;

// Cortex - knowledge base / brain of the system
export const cortexEntries = mysqlTable("cortex_entries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 128 }),
  tags: text("tags"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CortexEntry = typeof cortexEntries.$inferSelect;
export type InsertCortexEntry = typeof cortexEntries.$inferInsert;

// Keep existing database connections for backwards compatibility
export const databaseConnections = mysqlTable("database_connections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  dbType: mysqlEnum("dbType", ["mysql", "postgres", "mongodb", "redis", "sqlite"]).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: int("port").notNull(),
  database: varchar("database", { length: 255 }),
  username: varchar("username", { length: 255 }),
  encryptedPassword: text("encryptedPassword"),
  sslEnabled: int("sslEnabled").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "error", "unknown"]).default("unknown").notNull(),
  lastConnectedAt: timestamp("lastConnectedAt"),
  lastError: text("lastError"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type InsertDatabaseConnection = typeof databaseConnections.$inferInsert;

export const connectionLogs = mysqlTable("connection_logs", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["connect", "disconnect", "query", "test"]).notNull(),
  success: int("success").default(1).notNull(),
  errorMessage: text("errorMessage"),
  durationMs: int("durationMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConnectionLog = typeof connectionLogs.$inferSelect;
export type InsertConnectionLog = typeof connectionLogs.$inferInsert;
