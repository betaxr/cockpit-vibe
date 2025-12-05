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
    it("validates port range", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.connections.create({
          name: "Test DB",
          dbType: "mysql",
          host: "localhost",
          port: 99999, // Invalid port
        })
      ).rejects.toThrow();
    });

    it("validates required fields", async () => {
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
  });
});
