import { describe, expect, it } from "vitest";
/**
 * @fileoverview Unit Tests for Agent Management System
 * 
 * This test file covers all tRPC procedures related to the agent management
 * system including agents, processes, workspaces, cortex, statistics, teams,
 * and schedules.
 * 
 * @module server/agents.test
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

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

describe("agents router", () => {
  describe("agents.list", () => {
    it("returns list of agents for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.list();

      expect(Array.isArray(result)).toBe(true);
      // Should have seed data
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("agents.getById", () => {
    it("returns agent details for valid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.getById({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.name).toBeDefined();
    });

    it("throws NOT_FOUND for invalid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.agents.getById({ id: 99999 })).rejects.toThrow();
    });
  });
});

describe("processes router", () => {
  describe("processes.list", () => {
    it("returns list of processes for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("processes.running", () => {
    it("returns currently running processes", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.running();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("workspaces router", () => {
  describe("workspaces.list", () => {
    it("returns list of workspaces for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workspaces.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe("cortex router", () => {
  describe("cortex.list", () => {
    it("returns list of cortex entries for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cortex.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("stats router", () => {
  describe("stats.global", () => {
    it("returns global statistics for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.global();

      expect(result).toHaveProperty("activeAgents");
      expect(result).toHaveProperty("totalAgents");
      expect(result).toHaveProperty("runningProcesses");
      expect(result).toHaveProperty("totalProcesses");
      expect(result).toHaveProperty("totalValue");
      expect(result).toHaveProperty("totalTimeSaved");
      expect(result).toHaveProperty("avgReliability");
    });
  });
});

// ============================================================================
// TEAMS ROUTER TESTS
// ============================================================================

describe("teams router", () => {
  describe("teams.list", () => {
    it("returns list of teams for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("teams have required properties", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.list();
      const firstTeam = result[0];

      expect(firstTeam).toHaveProperty("name");
      expect(firstTeam).toHaveProperty("teamId");
      expect(firstTeam).toHaveProperty("agentCount");
      expect(firstTeam).toHaveProperty("color");
    });
  });

  describe("teams.getById", () => {
    it("returns team details for valid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.getById({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.name).toBeDefined();
    });

    it("throws NOT_FOUND for invalid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.teams.getById({ id: 99999 })).rejects.toThrow();
    });
  });
});

// ============================================================================
// SCHEDULE ROUTER TESTS
// ============================================================================

describe("schedule router", () => {
  describe("schedule.byAgent", () => {
    it("returns schedule for a specific agent", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.byAgent({ agentId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("schedule entries have required properties", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.byAgent({ agentId: 1 });
      
      if (result.length > 0) {
        const entry = result[0];
        expect(entry).toHaveProperty("title");
        expect(entry).toHaveProperty("startHour");
        expect(entry).toHaveProperty("endHour");
        expect(entry).toHaveProperty("color");
      }
    });
  });

  describe("schedule.week", () => {
    it("returns weekly schedule with 7 days", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.week({ weekStart: "2025-01-01" });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it("each day has entries array", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.week({ weekStart: "2025-01-01" });
      
      result.forEach(day => {
        expect(day).toHaveProperty("day");
        expect(day).toHaveProperty("dayIndex");
        expect(day).toHaveProperty("entries");
        expect(Array.isArray(day.entries)).toBe(true);
      });
    });
  });
});
