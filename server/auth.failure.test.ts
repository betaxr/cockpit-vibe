/**
 * @fileoverview Auth Failure Path Tests
 * 
 * Tests for authentication failure scenarios:
 * - Unauthorized access to protected routes
 * - Invalid credentials
 * - Missing tokens
 * 
 * @module server/auth.failure.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";

// Mock request object
const mockReq = {
  protocol: "http",
  headers: {},
};

// Mock response object
const mockRes = {
  clearCookie: vi.fn(),
  cookie: vi.fn(),
};

// Mock context without user (unauthenticated)
function createUnauthenticatedContext() {
  return {
    user: null,
    req: mockReq,
    res: mockRes,
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    getCookie: vi.fn(),
  };
}

// Mock context with regular user (not admin)
function createUserContext() {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "user@test.local",
      role: "user" as const,
      loginMethod: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: mockReq,
    res: mockRes,
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    getCookie: vi.fn(),
  };
}

describe("auth failure paths", () => {
  describe("unauthenticated access", () => {
    it("rejects unauthenticated access to agents.list", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.agents.list()).rejects.toThrow(TRPCError);
      await expect(caller.agents.list()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("rejects unauthenticated access to teams.list", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.teams.list()).rejects.toThrow(TRPCError);
    });

    it("rejects unauthenticated access to stats.global", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.stats.global()).rejects.toThrow(TRPCError);
    });

    it("rejects unauthenticated access to schedule.week", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.schedule.week({ weekStart: "2025-01-01" })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("testLogin validation", () => {
    it("returns success: false for invalid username", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({ username: "invalid", password: "admin" });
      expect(result.success).toBe(false);
    });

    it("returns success: false for invalid password", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({ username: "admin", password: "wrong" });
      expect(result.success).toBe(false);
    });

    it("returns success: false for empty credentials", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({ username: "", password: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("auth.me for unauthenticated users", () => {
    it("returns null for unauthenticated users", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("logout behavior", () => {
    it("allows logout for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();
      expect(result).toEqual({ success: true });
      // clearCookie is called on res, not ctx
      expect(mockRes.clearCookie).toHaveBeenCalled();
    });

    it("allows logout for unauthenticated users (clears any stale cookies)", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      // Logout is public - it just clears cookies
      const result = await caller.auth.logout();
      expect(result).toEqual({ success: true });
    });
  });
});

describe("response shape validation", () => {
  it("agents.list returns array with required properties", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const agents = await caller.agents.list();
    
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
    
    const agent = agents[0];
    expect(agent).toHaveProperty("id");
    expect(agent).toHaveProperty("name");
    expect(agent).toHaveProperty("agentId");
    expect(agent).toHaveProperty("status");
    expect(typeof agent.id).toBe("number");
    expect(typeof agent.name).toBe("string");
  });

  it("teams.list returns array with required properties", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const teams = await caller.teams.list();
    
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
    
    const team = teams[0];
    expect(team).toHaveProperty("id");
    expect(team).toHaveProperty("name");
    expect(team).toHaveProperty("agentCount");
    expect(typeof team.id).toBe("number");
    expect(typeof team.name).toBe("string");
  });

  it("stats.global returns required metrics", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.stats.global();
    
    expect(stats).toHaveProperty("totalProcesses");
    expect(stats).toHaveProperty("runningProcesses");
    expect(stats).toHaveProperty("activeAgents");
    expect(stats).toHaveProperty("totalAgents");
    expect(typeof stats.totalProcesses).toBe("number");
    expect(typeof stats.runningProcesses).toBe("number");
  });

  it("schedule.week returns 7 days", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const schedule = await caller.schedule.week({ weekStart: "2025-01-01" });
    
    expect(Array.isArray(schedule)).toBe(true);
    expect(schedule.length).toBe(7);
    
    schedule.forEach((day, index) => {
      expect(day).toHaveProperty("day");
      expect(day).toHaveProperty("dayIndex");
      expect(day).toHaveProperty("entries");
      expect(day.dayIndex).toBe(index);
      expect(Array.isArray(day.entries)).toBe(true);
    });
  });
});
