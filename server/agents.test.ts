import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createUserContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("agents router", () => {
  describe("agents.list", () => {
    it("returns a list of agents for authenticated users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("agents.create", () => {
    it("requires admin role to create agents", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.agents.create({
          name: "Test Agent",
          agentId: "test-123",
          hoursPerDay: 8,
        })
      ).rejects.toThrow("Admin access required");
    });

    it("allows admin to create agents", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const uniqueId = `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const result = await caller.agents.create({
        name: "New Agent",
        agentId: uniqueId,
        hoursPerDay: 24,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });
});

describe("processes router", () => {
  describe("processes.list", () => {
    it("returns a list of processes for authenticated users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("processes.create", () => {
    it("requires admin role to create processes", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.processes.create({
          name: "Test Process",
          priority: "medium",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("allows admin to create processes", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.processes.create({
        name: "New Process",
        description: "A test process",
        priority: "high",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });
});

describe("workspaces router", () => {
  describe("workspaces.list", () => {
    it("returns a list of workspaces for authenticated users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workspaces.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("workspaces.create", () => {
    it("requires admin role to create workspaces", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.workspaces.create({
          name: "Test Workspace",
          type: "pc",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("allows admin to create workspaces", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workspaces.create({
        name: "New Workspace",
        type: "vm",
        ipAddress: "192.168.1.100",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });
});

describe("cortex router", () => {
  describe("cortex.list", () => {
    it("returns a list of cortex entries for authenticated users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cortex.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("cortex.create", () => {
    it("requires admin role to create cortex entries", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.cortex.create({
          title: "Test Entry",
          content: "Test content",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("allows admin to create cortex entries", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cortex.create({
        title: "New Knowledge Entry",
        content: "This is important knowledge",
        category: "documentation",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });
});

describe("stats router", () => {
  describe("stats.global", () => {
    it("returns global statistics for authenticated users", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.global();

      // Check for the actual properties returned by the API
      expect(result).toHaveProperty("processCount");
      expect(result).toHaveProperty("valueGenerated");
      expect(result).toHaveProperty("timeSaved");
      expect(result).toHaveProperty("utilization");
      expect(typeof result.processCount).toBe("number");
      expect(typeof result.valueGenerated).toBe("number");
    });
  });
});
