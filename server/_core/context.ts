/**
 * @fileoverview tRPC Context Creation
 * 
 * Creates the context for each tRPC request, including user authentication.
 * Supports both Manus OAuth and standalone authentication.
 * 
 * @module server/_core/context
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

// Use standalone auth by default, fall back to Manus SDK if OAuth is configured
const getAuthService = async () => {
  if (ENV.isStandalone) {
    const { standaloneAuth } = await import("./standaloneAuth");
    return standaloneAuth;
  } else {
    const { sdk } = await import("./sdk");
    return sdk;
  }
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  tenantId: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const headerTenant = (opts.req.headers["x-tenant-id"] || opts.req.headers["x-tenant"] || "") as string;
  const defaultTenant = process.env.TENANT_ID || "demo";

  try {
    const authService = await getAuthService();
    user = await authService.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // In standalone mode, fall back to test admin so dashboards work without OAuth.
    if (ENV.isStandalone) {
      user = db.getTestAdminUser();
    } else {
      user = null;
    }
  }

  const tenantId = headerTenant || user?.tenantId || defaultTenant;
  if (!tenantId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "tenantId required" });
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    tenantId,
  };
}
