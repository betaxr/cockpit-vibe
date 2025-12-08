/**
 * @fileoverview Security Middleware
 * 
 * Provides CSRF protection and rate limiting for the API.
 * 
 * @module server/_core/security
 */

import { Request, Response, NextFunction } from "express";
import { ENV } from "./env";

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,  // 100 requests per minute
};

const authConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,  // 10 login attempts per 15 minutes
};

/**
 * Get client identifier for rate limiting
 */
function getClientId(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig = defaultConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(clientId);
    
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + config.windowMs };
      rateLimitStore.set(clientId, record);
    } else {
      record.count++;
    }
    
    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", config.maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, config.maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));
    
    if (record.count > config.maxRequests) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
      return;
    }
    
    next();
  };
}

/**
 * Auth-specific rate limiter (stricter)
 */
export const authRateLimit = rateLimit(authConfig);

/**
 * General API rate limiter
 */
export const apiRateLimit = rateLimit(defaultConfig);

/**
 * CSRF token generation
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * CSRF protection middleware
 * 
 * Validates CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API routes that use Bearer tokens
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return next();
  }
  
  // In development, optionally skip CSRF
  if (!ENV.isProduction && process.env.SKIP_CSRF === "true") {
    return next();
  }
  
  // Check CSRF token
  const csrfToken = req.headers["x-csrf-token"] || req.body?._csrf;
  const sessionCsrf = (req as any).session?.csrfToken;
  
  if (!csrfToken || csrfToken !== sessionCsrf) {
    // For now, log warning but don't block (gradual rollout)
    console.warn("[Security] CSRF token mismatch for", req.method, req.path);
    // Uncomment to enforce:
    // return res.status(403).json({ error: "Invalid CSRF token" });
  }
  
  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy (basic)
  if (ENV.isProduction) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com"
    );
  }
  
  next();
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, value] of entries) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);  // Clean up every minute
