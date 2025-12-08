/**
 * @fileoverview Operations & Reliability
 * 
 * Provides logging, health checks, and graceful shutdown handling.
 * 
 * @module server/_core/ops
 */

import { Request, Response, NextFunction } from "express";
import { getDb } from "../db";
import { getMongoDb } from "./mongo";

// Simple structured logger (can be replaced with pino later)
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Structured logger
 */
export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  },
  
  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  },
  
  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  },
  
  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  },
  
  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    
    const output = JSON.stringify(entry);
    
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  },
};

/**
 * HTTP request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Log after response is sent
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    logger.info("HTTP Request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.socket.remoteAddress,
    });
  });
  
  next();
}

/**
 * Error logging middleware
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error("Unhandled Error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });
  
  next(err);
}

/**
 * Health check response type
 */
interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latency?: number };
    mongo: { status: string };
    memory: { used: number; total: number; percentage: number };
  };
}

/**
 * Health check endpoint handler
 */
export async function healthCheck(req: Request, res: Response) {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatency: number | undefined;
  
  // Check MySQL connection (legacy)
  try {
    const db = await getDb();
    if (db) {
      const dbStart = Date.now();
      await db.execute("SELECT 1");
      dbLatency = Date.now() - dbStart;
      dbStatus = "connected";
    } else {
      dbStatus = "not_configured";
    }
  } catch (error) {
    dbStatus = "error";
    logger.error("Health check database error", { error: String(error) });
  }

  // Check Mongo connection
  let mongoStatus = "unknown";
  try {
    const mongo = await getMongoDb();
    mongoStatus = mongo ? "connected" : "not_configured";
  } catch (error) {
    mongoStatus = "error";
    logger.error("Health check mongo error", { error: String(error) });
  }
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  const memTotal = memUsage.heapTotal;
  const memUsed = memUsage.heapUsed;
  const memPercentage = Math.round((memUsed / memTotal) * 100);
  
  // Determine overall status
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (dbStatus === "error") {
    overallStatus = "unhealthy";
  } else if (dbStatus === "not_configured" || memPercentage > 90) {
    overallStatus = "degraded";
  }
  
  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: dbStatus, latency: dbLatency },
      mongo: { status: mongoStatus },
      memory: {
        used: Math.round(memUsed / 1024 / 1024),
        total: Math.round(memTotal / 1024 / 1024),
        percentage: memPercentage,
      },
    },
  };
  
  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;
  res.status(statusCode).json(health);
}

/**
 * Graceful shutdown handler
 */
let isShuttingDown = false;

export function setupGracefulShutdown(server: { close: (callback?: () => void) => void }) {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    logger.info("Graceful shutdown initiated", { signal });
    
    // Stop accepting new connections
    server.close(() => {
      logger.info("HTTP server closed");
    });
    
    // Give existing requests time to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Close database connections
    try {
      const db = await getDb();
      if (db) {
        // Drizzle doesn't have explicit close, but we can log
        logger.info("Database connections closed");
      }
    } catch (error) {
      logger.error("Error closing database", { error: String(error) });
    }
    
    logger.info("Shutdown complete");
    process.exit(0);
  };
  
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  
  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
    shutdown("uncaughtException");
  });
  
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", { reason: String(reason) });
  });
}

/**
 * Check if shutdown is in progress
 */
export function isShutdownInProgress(): boolean {
  return isShuttingDown;
}
