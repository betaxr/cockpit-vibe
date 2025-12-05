import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth router", () => {
  describe("auth.me", () => {
    it("returns current user for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("auth.logout", () => {
    it("clears session and returns success", async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { 
          clearCookie: () => {} 
        } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
    });
  });
});

describe("agents router - additional tests", () => {
  describe("agents.schedule", () => {
    it("returns schedule for an agent", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.schedule({ 
        agentId: 1, 
        date: new Date().toISOString().split('T')[0] 
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("agents.workspaces", () => {
    it("returns workspaces assigned to an agent", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.workspaces({ agentId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("agents.processes", () => {
    it("returns processes assigned to an agent", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.processes({ agentId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});


