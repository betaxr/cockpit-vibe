import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

// Database connections table - stores connection info for multiple databases
export const databaseConnections = mysqlTable("database_connections", {
  id: int("id").autoincrement().primaryKey(),
  /** User-friendly name for the connection */
  name: varchar("name", { length: 255 }).notNull(),
  /** Database type: mysql, postgres, mongodb, etc. */
  dbType: mysqlEnum("dbType", ["mysql", "postgres", "mongodb", "redis", "sqlite"]).notNull(),
  /** Hostname or IP address */
  host: varchar("host", { length: 255 }).notNull(),
  /** Port number */
  port: int("port").notNull(),
  /** Database name */
  database: varchar("database", { length: 255 }),
  /** Username for authentication */
  username: varchar("username", { length: 255 }),
  /** Encrypted password (stored securely) */
  encryptedPassword: text("encryptedPassword"),
  /** SSL enabled */
  sslEnabled: int("sslEnabled").default(0).notNull(),
  /** Connection status: active, inactive, error */
  status: mysqlEnum("status", ["active", "inactive", "error", "unknown"]).default("unknown").notNull(),
  /** Last successful connection timestamp */
  lastConnectedAt: timestamp("lastConnectedAt"),
  /** Last error message if any */
  lastError: text("lastError"),
  /** User who created this connection */
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type InsertDatabaseConnection = typeof databaseConnections.$inferInsert;

// Connection logs table - tracks connection attempts and queries
export const connectionLogs = mysqlTable("connection_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the database connection */
  connectionId: int("connectionId").notNull(),
  /** User who performed the action */
  userId: int("userId").notNull(),
  /** Type of action: connect, disconnect, query, test */
  action: mysqlEnum("action", ["connect", "disconnect", "query", "test"]).notNull(),
  /** Success or failure */
  success: int("success").default(1).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Duration in milliseconds */
  durationMs: int("durationMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConnectionLog = typeof connectionLogs.$inferSelect;
export type InsertConnectionLog = typeof connectionLogs.$inferInsert;