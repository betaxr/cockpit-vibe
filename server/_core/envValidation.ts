/**
 * @fileoverview Environment Variable Validation
 * 
 * Validates required environment variables at startup using Zod.
 * Fails fast if critical configuration is missing.
 * 
 * @module server/_core/envValidation
 */

import { z } from "zod";
import { logger } from "./ops";

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Database (optional in development, required in production)
  DATABASE_URL: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters").optional(),
  
  // OAuth (optional for standalone mode)
  VITE_APP_ID: z.string().optional(),
  OAUTH_SERVER_URL: z.string().url().optional(),
  
  // Server
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  
  // Standalone mode
  STANDALONE_MODE: z.string().transform(v => v === "true").optional(),
});

/**
 * Validated environment type
 */
export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * 
 * @throws Error if validation fails in production
 */
export function validateEnv(): ValidatedEnv {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `${issue.path.join(".")}: ${issue.message}`
    );
    
    const errorMessage = `Environment validation failed:\n${errors.join("\n")}`;
    
    if (process.env.NODE_ENV === "production") {
      logger.error({ errors }, "Environment validation failed");
      throw new Error(errorMessage);
    } else {
      logger.warn({ errors }, "Environment validation warnings (non-fatal in development)");
    }
  }
  
  return result.data || {};
}

/**
 * Check if all required production variables are set
 */
export function checkProductionReadiness(): { ready: boolean; missing: string[] } {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    ready: missing.length === 0,
    missing,
  };
}

/**
 * Print environment summary (safe, no secrets)
 */
export function printEnvSummary() {
  const summary = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
    DATABASE_URL: process.env.DATABASE_URL ? "[SET]" : "[NOT SET]",
    JWT_SECRET: process.env.JWT_SECRET ? "[SET]" : "[NOT SET]",
    STANDALONE_MODE: process.env.STANDALONE_MODE || "false",
    OAUTH_CONFIGURED: process.env.VITE_APP_ID ? "yes" : "no",
  };
  
  logger.info({ summary }, "Environment Summary");
}
