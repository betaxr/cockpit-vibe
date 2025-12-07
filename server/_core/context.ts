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
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authService = await getAuthService();
    user = await authService.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
