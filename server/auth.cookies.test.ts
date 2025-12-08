/**
 * @fileoverview Cookie issuance/clearing tests without HTTP server.
 * Uses router caller with mocked Express response to assert cookie options.
 */

import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "@shared/const";

const mockReq = { protocol: "http", headers: {} };

function createMockContext() {
  const res = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  return {
    user: null,
    req: mockReq,
    res,
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    getCookie: vi.fn(),
  };
}

describe("auth cookies", () => {
  it("sets cookie with lax sameSite on testLogin (HTTP)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.testLogin({
      username: "admin",
      password: "admin",
    });

    expect(result.success).toBe(true);
    expect(ctx.res.cookie).toHaveBeenCalled();
    const [name, value, opts] = ctx.res.cookie.mock.calls[0];
    expect(name).toBe(COOKIE_NAME);
    expect(typeof value).toBe("string");
    expect(opts).toMatchObject({
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
  });

  it("clears cookie on logout", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });

    expect(ctx.res.clearCookie).toHaveBeenCalled();
    const [name, opts] = ctx.res.clearCookie.mock.calls[0];
    expect(name).toBe(COOKIE_NAME);
    expect(opts).toMatchObject({ path: "/" });
  });
});
