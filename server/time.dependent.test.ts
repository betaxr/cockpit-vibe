/**
 * @fileoverview Time-dependent router tests
 *
 * Freezes time to make running process calculations deterministic.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const mockReq = { protocol: "http", headers: {} };
const mockRes = { clearCookie: vi.fn(), cookie: vi.fn() };

function createUserContext() {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "user@test.local",
      role: "user" as const,
      loginMethod: "test",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: mockReq,
    res: mockRes,
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    getCookie: vi.fn(),
  };
}

describe("time-dependent routes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes.list marks entries running when within schedule window", async () => {
    // 09:00 hits multiple schedule windows (see seedData).
    vi.setSystemTime(new Date("2025-01-01T09:00:00Z"));
    const caller = appRouter.createCaller(createUserContext());

    const processes = await caller.processes.list();

    expect(Array.isArray(processes)).toBe(true);
    const running = processes.filter(p => p.status === "running");
    expect(running.length).toBeGreaterThan(0);
    running.forEach(p => {
      expect(typeof p.startHour === "number" || p.startHour === undefined).toBe(true);
    });
  });

  it("processes.running only returns entries active at frozen time", async () => {
    // 07:30 inside first Social Media Posting block.
    vi.setSystemTime(new Date("2025-01-01T07:30:00"));
    const caller = appRouter.createCaller(createUserContext());
    const currentHour = new Date().getHours();

    const running = await caller.processes.running();

    expect(Array.isArray(running)).toBe(true);
    expect(running.length).toBeGreaterThan(0);
    running.forEach(entry => {
      expect(entry.startHour).toBeLessThanOrEqual(currentHour);
      expect(entry.endHour).toBeGreaterThan(currentHour);
      expect(entry).toHaveProperty("agentName");
      expect(entry).toHaveProperty("title");
    });
  });
});
