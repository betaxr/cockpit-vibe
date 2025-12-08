/**
 * @fileoverview Environment Configuration
 * 
 * This module exports environment variables for the application.
 * For standalone operation (without Manus), only DATABASE_URL and JWT_SECRET are required.
 * 
 * @module server/_core/env
 */

export const ENV = {
  // Required for standalone operation
  cookieSecret: process.env.JWT_SECRET ?? "",
  encryptionKey: process.env.ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  mongoDbName: process.env.MONGO_DB ?? "cockpit_vibe",
  
  // Optional - for Manus OAuth (can be empty for standalone)
  appId: process.env.VITE_APP_ID ?? "standalone",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Optional - for Manus built-in APIs (LLM, Storage, etc.)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Standalone mode detection
  isStandalone: !process.env.OAUTH_SERVER_URL || process.env.STANDALONE_MODE === "true",
};
