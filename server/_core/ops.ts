/**
 * @fileoverview Operations & Reliability (logging, health, shutdown)
 */

import { Request, Response, NextFunction } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { getDb } from "../db";
import { closeMongo, getMongoDb } from "./mongo";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
  base: { service: "cockpit-vibe" },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const requestLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customProps: (req) => ({
    userAgent: req.headers["user-agent"],
    ip: req.socket.remoteAddress,
  }),
});

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled Error");
  next(err);
}

type HealthStatus = {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latency?: number };
    mongo: { status: string };
    memory: { used: number; total: number; percentage: number };
  };
};

export async function healthCheck(req: Request, res: Response) {
  let dbStatus = "unknown";
  let dbLatency: number | undefined;

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
    logger.error({ error: String(error) }, "Health check database error");
  }

  let mongoStatus = "unknown";
  try {
    const mongo = await getMongoDb();
    mongoStatus = mongo ? "connected" : "not_configured";
  } catch (error) {
    mongoStatus = "error";
    logger.error({ error: String(error) }, "Health check mongo error");
  }

  const memUsage = process.memoryUsage();
  const memTotal = memUsage.heapTotal;
  const memUsed = memUsage.heapUsed;
  const memPercentage = Math.round((memUsed / memTotal) * 100);

  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (dbStatus === "error" || mongoStatus === "error") {
    overallStatus = "unhealthy";
  } else if (dbStatus === "not_configured" || mongoStatus === "not_configured" || memPercentage > 90) {
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

let isShuttingDown = false;
export function setupGracefulShutdown(server: { close: (callback?: () => void) => void }) {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Graceful shutdown initiated");
    server.close(() => {
      logger.info("HTTP server closed");
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const db = await getDb();
      if (db) {
        logger.info("Database connections closed");
      }
      await closeMongo();
    } catch (error) {
      logger.error({ error: String(error) }, "Error during shutdown");
    }
    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
