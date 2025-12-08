#!/usr/bin/env node

const required = ["JWT_SECRET", "VITE_APP_ID", "TENANT_ID"];
const missing = required.filter(key => !process.env[key] || process.env[key].length === 0);

if (missing.length) {
  console.error(`[env-check] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

console.log("[env-check] Environment parity check passed.");
