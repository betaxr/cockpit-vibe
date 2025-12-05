import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("auth router", () => {
  describe("testLogin", () => {
    it("accepts valid admin/admin credentials", async () => {
      const { ctx, setCookies } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({
        username: "admin",
        password: "admin",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Login successful");
      // Should have set a session cookie
      expect(setCookies.length).toBeGreaterThan(0);
    });

    it("rejects invalid username", async () => {
      const { ctx, setCookies } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({
        username: "wronguser",
        password: "admin",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
      // Should not have set any cookies
      expect(setCookies.length).toBe(0);
    });

    it("rejects invalid password", async () => {
      const { ctx, setCookies } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({
        username: "admin",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
      expect(setCookies.length).toBe(0);
    });

    it("rejects empty credentials", async () => {
      const { ctx, setCookies } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.testLogin({
        username: "",
        password: "",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
      expect(setCookies.length).toBe(0);
    });
  });

  describe("me", () => {
    it("returns null for unauthenticated users", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("returns user data for authenticated users", async () => {
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "test",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).not.toBeNull();
      expect(result?.openId).toBe("test-user");
      expect(result?.role).toBe("admin");
    });
  });

  describe("logout", () => {
    it("clears session cookie on logout", async () => {
      const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
      
      const ctx: TrpcContext = {
        user: {
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "test",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: (name: string, options: Record<string, unknown>) => {
            clearedCookies.push({ name, options });
          },
        } as unknown as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();
      
      expect(result.success).toBe(true);
      expect(clearedCookies.length).toBe(1);
      expect(clearedCookies[0]?.options).toMatchObject({
        maxAge: -1,
      });
    });
  });
});
