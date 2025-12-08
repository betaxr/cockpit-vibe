/**
 * @fileoverview Secrets provider abstraction.
 * 
 * Currently returns values from environment variables.
 * Can be extended to fetch from Vault/KMS.
 */

export async function getSecret(key: string, fallback?: string): Promise<string | undefined> {
  const envKey = key.toUpperCase();
  const value = process.env[envKey];
  if (value && value.length > 0) return value;
  return fallback;
}

export function requireSecret(key: string): string {
  const envKey = key.toUpperCase();
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing required secret: ${envKey}`);
  }
  return value;
}
