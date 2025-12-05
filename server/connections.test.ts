import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("connections router", () => {
  describe("access control", () => {
    it("denies access to list for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.connections.list()).rejects.toThrow("Admin access required");
    });

    it("denies access to create for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "mysql",
          host: "localhost",
          port: 3306,
        })
      ).rejects.toThrow("Admin access required");
    });

    it("denies access to delete for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.connections.delete({ id: 1 })).rejects.toThrow("Admin access required");
    });

    it("denies access to test for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.connections.test({ id: 1 })).rejects.toThrow("Admin access required");
    });
  });

  describe("admin access", () => {
    it("allows admin to list connections", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This will return empty array or actual connections from DB
      const result = await caller.connections.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("input validation", () => {
    it("validates port range - too high", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "mysql",
          host: "localhost",
          port: 99999, // Invalid port - too high
        })
      ).rejects.toThrow();
    });

    it("validates port range - too low", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "mysql",
          host: "localhost",
          port: 0, // Invalid port - too low
        })
      ).rejects.toThrow();
    });

    it("validates required fields - empty name", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "", // Empty name
          dbType: "mysql",
          host: "localhost",
          port: 3306,
        })
      ).rejects.toThrow();
    });

    it("validates required fields - empty host", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "mysql",
          host: "", // Empty host
          port: 3306,
        })
      ).rejects.toThrow();
    });

    it("validates dbType enum", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "invalid" as "mysql", // Invalid type
          host: "localhost",
          port: 3306,
        })
      ).rejects.toThrow();
    });

    it("accepts valid postgres connection", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This should not throw for valid input
      const result = await caller.connections.create({
        name: "Postgres Test",
        dbType: "postgres",
        host: "db.example.com",
        port: 5432,
        database: "testdb",
        username: "admin",
        password: "secret123",
        sslEnabled: true,
      });

      expect(result).toHaveProperty("id");
      expect(result.success).toBe(true);
    });

    it("accepts valid mongodb connection", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.connections.create({
        name: "MongoDB Test",
        dbType: "mongodb",
        host: "mongo.example.com",
        port: 27017,
        database: "testdb",
      });

      expect(result).toHaveProperty("id");
      expect(result.success).toBe(true);
    });

    it("accepts valid redis connection", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.connections.create({
        name: "Redis Test",
        dbType: "redis",
        host: "redis.example.com",
        port: 6379,
      });

      expect(result).toHaveProperty("id");
      expect(result.success).toBe(true);
    });
  });

  describe("update operations", () => {
    it("denies update for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.update({
          id: 1,
          name: "Updated Name",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("denies getById for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.getById({ id: 1 })
      ).rejects.toThrow("Admin access required");
    });

    it("denies logs access for non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.logs({ connectionId: 1 })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("connection logs", () => {
    it("allows admin to fetch logs", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This should return an array (empty or with logs)
      const result = await caller.connections.logs({ connectionId: 1, limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("validates limit parameter", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Limit too high should throw
      await expect(
        caller.connections.logs({ connectionId: 1, limit: 200 })
      ).rejects.toThrow();
    });
  });
});
