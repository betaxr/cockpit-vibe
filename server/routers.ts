import { COOKIE_NAME } from "@shared/const";
/**
 * @fileoverview Main tRPC Router Configuration for Cockpit Vibe
 * 
 * This file defines all API endpoints for the Agent Management System.
 * The system manages teams of AI agents, their processes, schedules,
 * and workspaces in an enterprise automation context.
 * 
 * @module server/routers
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, roleProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUser, getUserByOpenId } from "./db";
import { standaloneAuth } from "./_core/standaloneAuth";
import { ENV } from "./_core/env";
import {
  fetchAgents,
  fetchTeams,
  fetchWorkspaces,
  fetchProcesses,
  fetchScheduleEntries,
  fetchRunningProcesses,
  fetchGlobalStats,
} from "./services/dataProvider";
import { logAudit } from "./services/audit";
import { getLayout, upsertLayout } from "./services/layouts";
import { resolveRange } from "./services/timeRange";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Admin middleware helper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    testLogin: publicProcedure.input(z.object({
      username: z.string(),
      password: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Dev/test backdoor: hard-disabled in production
      const testLoginEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_TEST_LOGIN !== "false";
      if (!testLoginEnabled) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Test login disabled' });
      }
      if (input.username === 'admin' && input.password === 'admin') {
        const testOpenId = 'test-admin-user';
        const tenantId = ctx.tenantId ?? (process.env.TENANT_ID ?? "default");
        await upsertUser({
          openId: testOpenId,
          tenantId,
          name: 'Test Admin',
          email: 'admin@test.local',
          loginMethod: 'test',
          role: 'admin',
          lastSignedIn: new Date(),
        });
        const user = await getUserByOpenId(testOpenId, tenantId);
        if (!user) return { success: false, message: 'User creation failed' };
        const token = await standaloneAuth.createSessionToken(user.openId, {
          name: user.name || 'Test Admin',
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        await logAudit({
          action: "auth.testLogin",
          actor: { id: testOpenId, role: 'admin' },
          tenantId,
          meta: { username: input.username },
        });
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'Invalid credentials' };
    }),
  }),

  // Global statistics using seed data
  stats: router({
    global: protectedProcedure
      .input(z.object({ from: z.string().optional(), to: z.string().optional(), range: z.enum(["day", "week", "month"]).optional() }))
      .query(async ({ ctx, input }) => {
        const { from, to, range } = input;
        const { fromDate, toDate } = resolveRange(from, to, range, "day");
        return fetchGlobalStats(ctx.tenantId, fromDate, toDate);
      }),
  }),

  // Teams from seed data
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return fetchTeams(ctx.tenantId);
    }),
    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
      const teams = await fetchTeams(ctx.tenantId);
      const team = teams.find(t => t.id === input.id || t.externalId === input.id);
      if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
      return team;
    }),
  }),

  // Agents from seed data
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return fetchAgents(ctx.tenantId);
    }),
    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
      const agents = await fetchAgents(ctx.tenantId);
      const agent = agents.find(a => a.id === input.id || a.externalId === input.id);
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND' });
      return agent;
    }),
    workspaces: protectedProcedure.input(z.object({ agentId: z.string() })).query(async ({ input, ctx }) => {
      const workspaces = await fetchWorkspaces(ctx.tenantId);
      return workspaces.filter(ws => ws.agent?.id === input.agentId);
    }),
    processes: protectedProcedure.input(z.object({ agentId: z.string() })).query(async ({ input, ctx }) => {
      const processes = await fetchProcesses(ctx.tenantId);
      return processes
        .filter(p => p.agent?.id === input.agentId)
        .map(p => ({
          id: p.id,
          name: p.name,
          processId: p.processId,
          description: p.description,
          category: p.category,
          status: p.status ?? 'completed',
          valueGenerated: p.totalValue,
          timeSavedMinutes: p.totalTimeSaved,
          scheduleCount: p.scheduleCount,
          successCount: p.successCount,
          failCount: p.failCount,
          reliability: p.reliability,
        }));
    }),
    schedule: protectedProcedure.input(z.object({
      agentId: z.string(),
      date: z.string(),
    })).query(async ({ input, ctx }) => {
      const schedule = await fetchScheduleEntries(ctx.tenantId);
      return schedule
        .filter(entry => entry.agentId === input.agentId)
        .map((entry, index) => ({
          id: entry.id ?? index + 1,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          processId: entry.processId ?? null,
        }));
    }),
    currentProcess: protectedProcedure.input(z.object({ agentId: z.string() })).query(async ({ input, ctx }) => {
      const schedule = await fetchScheduleEntries(ctx.tenantId);
      const currentHour = new Date().getHours();
      const entry = schedule.find(e => e.agentId === input.agentId && e.startHour <= currentHour && e.endHour > currentHour);
      if (!entry) return null;
      return {
        title: entry.title,
        startHour: entry.startHour,
        endHour: entry.endHour,
        color: entry.color,
      };
    }),
  }),

  // Workspaces from seed data
  workspaces: router({
    list: roleProcedure(["admin", "editor"]).query(async ({ ctx }) => {
      return fetchWorkspaces(ctx.tenantId);
    }),
  }),

  // Processes from seed data with statistics
  processes: router({
    list: roleProcedure(["admin", "editor"]).query(async ({ ctx }) => {
      return fetchProcesses(ctx.tenantId);
    }),
    running: roleProcedure(["admin", "editor"]).query(async ({ ctx }) => {
      return fetchRunningProcesses(ctx.tenantId);
    }),
  }),

  // Schedule for week view
  schedule: router({
    byAgent: protectedProcedure.input(z.object({
      agentId: z.string(),
    })).query(async ({ input, ctx }) => {
      const schedule = await fetchScheduleEntries(ctx.tenantId);
      return schedule
        .filter(entry => entry.agentId === input.agentId)
        .map((entry, index) => ({
          id: entry.id ?? index + 1,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          processId: entry.processId ?? null,
        }));
    }),
    week: protectedProcedure.input(z.object({
      agentId: z.string().optional(),
      weekStart: z.string(),
    })).query(async ({ input, ctx }) => {
      const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
      const schedule = await fetchScheduleEntries(ctx.tenantId);
      const agents = await fetchAgents(ctx.tenantId);
      const entries = input.agentId !== undefined
        ? schedule.filter(e => e.agentId === input.agentId)
        : schedule;
      
      return days.map((day, dayIndex) => ({
        day,
        dayIndex,
        entries: entries.map((entry, index) => ({
          id: `${dayIndex}-${entry.id ?? index}`,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          agentId: entry.agentId ?? 0,
          agentName: agents.find(a => a.id === entry.agentId)?.name || 'Unknown',
        })),
      }));
    }),
  }),

  // Cortex (knowledge base) - placeholder
  cortex: router({
    list: protectedProcedure.query(() => {
      return [
        {
          id: 1,
          title: "Bestellprozess Dokumentation",
          content: "Anleitung für den automatisierten Bestellprozess...",
          category: "Prozesse",
          tags: "bestellung, automatisierung",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Social Media Richtlinien",
          content: "Guidelines für automatisierte Social Media Posts...",
          category: "Marketing",
          tags: "social, guidelines",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Support-Ticket Kategorien",
          content: "Übersicht der Ticket-Kategorien und Prioritäten...",
          category: "Support",
          tags: "tickets, kategorien",
          createdAt: new Date().toISOString(),
        },
      ];
    }),
  }),

  layouts: router({
    get: protectedProcedure.input(z.object({ page: z.string() })).query(async ({ ctx, input }) => {
      const userId = ctx.user?.openId;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const layout = await getLayout(ctx.tenantId, userId, input.page);
      if (!layout) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return layout;
    }),
    put: protectedProcedure.input(z.object({ page: z.string(), positions: z.any() })).mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.openId;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      await upsertLayout(ctx.tenantId, userId, input.page, input.positions);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
