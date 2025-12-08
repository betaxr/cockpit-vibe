/**
 * @fileoverview Standalone Authentication Service
 * 
 * This module provides authentication without Manus OAuth dependency.
 * It uses bcrypt for password hashing and JWT for session management.
 * 
 * @module server/_core/standaloneAuth
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

// Salt rounds for bcrypt
const SALT_ROUNDS = 12;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

/**
 * Standalone Authentication Service
 * Provides local username/password authentication without external OAuth
 */
class StandaloneAuthService {
  
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a unique openId for local users
   */
  generateLocalOpenId(username: string): string {
    return `local-${username}-${Date.now()}`;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret || "test-secret-key-for-development-only-32chars";
    // In production, require at least 32 characters
    if (ENV.isProduction && secret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters in production");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      appId: ENV.appId || "standalone",
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a session token
   */
  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (typeof openId !== "string" || openId.length === 0) {
        return null;
      }

      return {
        openId: openId as string,
        appId: (appId as string) || "standalone",
        name: (name as string) || "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Authenticate a request using session cookie
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);

    if (!user) {
      if (!db.isDatabaseConfigured()) {
        return db.getTestAdminUser(session.openId);
      }
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }

  /**
   * Register a new user with username/password
   */
  async registerUser(
    username: string,
    password: string,
    name?: string,
    email?: string,
    role: "user" | "admin" = "user"
  ): Promise<User | null> {
    const passwordHash = await this.hashPassword(password);
    const openId = this.generateLocalOpenId(username);

    await db.upsertUser({
      openId,
      name: name || username,
      email: email || null,
      loginMethod: "local",
      role,
      lastSignedIn: new Date(),
    });

    // Update with password hash (need to add this to db.ts)
    const user = await db.getUserByOpenId(openId);
    return user || null;
  }

  /**
   * Login with username/password
   * Returns user if credentials are valid, null otherwise
   */
  async loginWithPassword(
    username: string,
    password: string
  ): Promise<User | null> {
    // For test login (admin/admin)
    if (username === "admin" && password === "admin") {
      const testOpenId = "test-admin-user";
      let user = await db.getUserByOpenId(testOpenId);
      
      if (!user) {
        await db.upsertUser({
          openId: testOpenId,
          name: "Test Admin",
          email: "admin@test.local",
          loginMethod: "local",
          role: "admin",
          lastSignedIn: new Date(),
        });
        user = await db.getUserByOpenId(testOpenId);
      }
      if (!user && !db.isDatabaseConfigured()) {
        user = db.getTestAdminUser(testOpenId);
      }

      return user || null;
    }

    // TODO: Implement real username/password lookup
    // const user = await db.getUserByUsername(username);
    // if (!user || !user.passwordHash) return null;
    // const valid = await this.verifyPassword(password, user.passwordHash);
    // return valid ? user : null;

    return null;
  }
}

export const standaloneAuth = new StandaloneAuthService();

// Export as sdk-compatible interface for easy migration
export const sdk = standaloneAuth;
