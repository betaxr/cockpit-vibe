/**
 * @fileoverview Unit Tests for Agent Management System
 * 
 * This test file covers all tRPC procedures related to the agent management
 * system including agents, processes, workspaces, cortex, and statistics.
 * 
 * **Test Coverage:**
 * - agents.list: List all agents with team information
 * - agents.getById: Get specific agent by ID
 * - processes.list: List all processes with statistics
 * - processes.running: Get currently running processes
 * - workspaces.list: List all workspaces
 * - cortex.list: List knowledge base entries
 * - stats.global: Get global KPI statistics
 * - teams.list: List all teams
 * - schedule.byAgent: Get agent schedule
 * 
 * @module server/agents.test
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/** Type for authenticated user from context */
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/**
 * Creates a mock user context for testing.
 * Simulates an authenticated user with specified role.
 * 
 * @param role - User role ('user' or 'admin')
 * @returns Mock TrpcContext with authenticated user
 */
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

// ============================================================================
// AGENTS ROUTER TESTS
// ============================================================================

describe("agents router", () => {
  describe("agents.list", () => {
    it("returns list of agents for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns agents with team information", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.list();
      const firstAgent = result[0];

      expect(firstAgent).toHaveProperty("id");
      expect(firstAgent).toHaveProperty("name");
      expect(firstAgent).toHaveProperty("team");
      expect(firstAgent).toHaveProperty("status");
      expect(firstAgent).toHaveProperty("avatarColor");
    });
  });

  describe("agents.getById", () => {
    it("returns agent details for valid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.getById({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.name).toBeDefined();
      expect(result?.team).toBeDefined();
    });

    it("throws NOT_FOUND for invalid ID", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.agents.getById({ id: 99999 })).rejects.toThrow();
    });
  });

  describe("agents.schedule", () => {
    it("returns schedule entries for an agent", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.schedule({ agentId: 1, date: "2025-01-01" });

      expect(Array.isArray(result)).toBe(true);
    });

    it("schedule entries have required properties", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.schedule({ agentId: 1, date: "2025-01-01" });
      
      if (result.length > 0) {
        const entry = result[0];
        expect(entry).toHaveProperty("title");
        expect(entry).toHaveProperty("startHour");
        expect(entry).toHaveProperty("endHour");
        expect(entry).toHaveProperty("color");
      }
    });
  });
});

// ============================================================================
// PROCESSES ROUTER TESTS
// ============================================================================

describe("processes router", () => {
  describe("processes.list", () => {
    it("returns list of processes for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("processes have reliability statistics", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.list();
      const firstProcess = result[0];

      expect(firstProcess).toHaveProperty("reliability");
      expect(firstProcess).toHaveProperty("totalValue");
      expect(firstProcess).toHaveProperty("totalTimeSaved");
      expect(firstProcess).toHaveProperty("status");
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

// ============================================================================
// WORKSPACES ROUTER TESTS
// ============================================================================

describe("workspaces router", () => {
  describe("workspaces.list", () => {
    it("returns list of workspaces for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workspaces.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("workspaces have agent information", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workspaces.list();
      const firstWorkspace = result[0];

      expect(firstWorkspace).toHaveProperty("name");
      expect(firstWorkspace).toHaveProperty("type");
      expect(firstWorkspace).toHaveProperty("status");
      expect(firstWorkspace).toHaveProperty("location");
    });
  });
});

// ============================================================================
// CORTEX ROUTER TESTS
// ============================================================================

describe("cortex router", () => {
  describe("cortex.list", () => {
    it("returns list of cortex entries for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cortex.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("cortex entries have required properties", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cortex.list();
      
      if (result.length > 0) {
        const entry = result[0];
        expect(entry).toHaveProperty("title");
        expect(entry).toHaveProperty("content");
        expect(entry).toHaveProperty("category");
      }
    });
  });
});

// ============================================================================
// STATS ROUTER TESTS
// ============================================================================

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

    it("statistics have valid numeric values", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.global();

      expect(typeof result.activeAgents).toBe("number");
      expect(typeof result.totalAgents).toBe("number");
      expect(typeof result.totalValue).toBe("number");
      expect(result.avgReliability).toBeGreaterThanOrEqual(0);
      expect(result.avgReliability).toBeLessThanOrEqual(100);
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
  });

  describe("schedule.week", () => {
    it("returns weekly schedule", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.week({ weekStart: "2025-01-01" });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7); // 7 days
    });

    it("weekly schedule has day entries", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.schedule.week({ weekStart: "2025-01-01" });
      const firstDay = result[0];

      expect(firstDay).toHaveProperty("day");
      expect(firstDay).toHaveProperty("dayIndex");
      expect(firstDay).toHaveProperty("entries");
    });
  });
});
