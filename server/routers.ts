import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUser, getUserByOpenId } from "./db";
import { sdk } from "./_core/sdk";
import {
  seedTeams,
  seedAgents,
  seedWorkspaces,
  seedProcesses,
  seedScheduleEntries,
  getProcessReliability,
  getProcessTotalValue,
  getAgentCurrentProcess,
  getGlobalStats as getSeedGlobalStats,
} from "./seedData";

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
      if (input.username === 'admin' && input.password === 'admin') {
        const testOpenId = 'test-admin-user';
        await upsertUser({
          openId: testOpenId,
          name: 'Test Admin',
          email: 'admin@test.local',
          loginMethod: 'test',
          role: 'admin',
          lastSignedIn: new Date(),
        });
        const user = await getUserByOpenId(testOpenId);
        if (!user) return { success: false, message: 'User creation failed' };
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || 'Test Admin',
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'Invalid credentials' };
    }),
  }),

  // Global statistics using seed data
  stats: router({
    global: protectedProcedure.query(() => {
      return getSeedGlobalStats();
    }),
  }),

  // Teams from seed data
  teams: router({
    list: protectedProcedure.query(() => {
      return seedTeams.map((team, index) => ({
        id: index + 1,
        ...team,
      }));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
      const team = seedTeams[input.id - 1];
      if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
      return { id: input.id, ...team };
    }),
  }),

  // Agents from seed data
  agents: router({
    list: protectedProcedure.query(() => {
      return seedAgents.map((agent, index) => ({
        id: index + 1,
        ...agent,
        team: seedTeams[agent.teamIndex],
      }));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
      const agent = seedAgents[input.id - 1];
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND' });
      return {
        id: input.id,
        ...agent,
        team: seedTeams[agent.teamIndex],
      };
    }),
    workspaces: protectedProcedure.input(z.object({ agentId: z.number() })).query(({ input }) => {
      return seedWorkspaces
        .filter(ws => ws.agentIndex === input.agentId - 1)
        .map((ws, index) => ({
          id: index + 1,
          name: ws.name,
          workspaceId: ws.workspaceId,
          type: ws.type,
          status: ws.status,
          location: ws.location,
        }));
    }),
    processes: protectedProcedure.input(z.object({ agentId: z.number() })).query(({ input }) => {
      return seedProcesses
        .filter(p => p.agentIndex === input.agentId - 1)
        .map((p, index) => ({
          id: index + 1,
          name: p.name,
          processId: p.processId,
          description: p.description,
          category: p.category,
          status: 'completed' as const,
          valueGenerated: getProcessTotalValue(p),
          timeSavedMinutes: p.successCount * p.estimatedMinutes,
          scheduleCount: p.scheduleCount,
          successCount: p.successCount,
          failCount: p.failCount,
          reliability: getProcessReliability(p),
        }));
    }),
    schedule: protectedProcedure.input(z.object({
      agentId: z.number(),
      date: z.string(),
    })).query(({ input }) => {
      return seedScheduleEntries
        .filter(entry => entry.agentIndex === input.agentId - 1)
        .map((entry, index) => ({
          id: index + 1,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          processId: entry.processIndex !== undefined ? entry.processIndex + 1 : null,
        }));
    }),
    currentProcess: protectedProcedure.input(z.object({ agentId: z.number() })).query(({ input }) => {
      const currentHour = new Date().getHours();
      const entry = getAgentCurrentProcess(input.agentId - 1, currentHour);
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
    list: protectedProcedure.query(() => {
      return seedWorkspaces.map((ws, index) => ({
        id: index + 1,
        name: ws.name,
        workspaceId: ws.workspaceId,
        type: ws.type,
        status: ws.status,
        location: ws.location,
        agent: seedAgents[ws.agentIndex] ? {
          id: ws.agentIndex + 1,
          name: seedAgents[ws.agentIndex].name,
          status: seedAgents[ws.agentIndex].status,
        } : null,
      }));
    }),
  }),

  // Processes from seed data with statistics
  processes: router({
    list: protectedProcedure.query(() => {
      const currentHour = new Date().getHours();
      
      return seedProcesses.map((p, index) => {
        const agent = seedAgents[p.agentIndex];
        const isRunning = seedScheduleEntries.some(
          entry => entry.agentIndex === p.agentIndex && 
                   entry.processIndex === index &&
                   entry.startHour <= currentHour && 
                   entry.endHour > currentHour
        );
        
        return {
          id: index + 1,
          name: p.name,
          processId: p.processId,
          description: p.description,
          category: p.category,
          estimatedMinutes: p.estimatedMinutes,
          valuePerRun: p.valuePerRun,
          scheduleCount: p.scheduleCount,
          successCount: p.successCount,
          failCount: p.failCount,
          reliability: getProcessReliability(p),
          totalValue: getProcessTotalValue(p),
          totalTimeSaved: p.successCount * p.estimatedMinutes,
          status: isRunning ? 'running' : 'idle',
          agent: agent ? {
            id: p.agentIndex + 1,
            name: agent.name,
            avatarColor: agent.avatarColor,
          } : null,
        };
      });
    }),
    running: protectedProcedure.query(() => {
      const currentHour = new Date().getHours();
      const runningEntries = seedScheduleEntries.filter(
        entry => entry.startHour <= currentHour && entry.endHour > currentHour
      );
      
      return runningEntries.map(entry => {
        const agent = seedAgents[entry.agentIndex];
        const process = entry.processIndex !== undefined ? seedProcesses[entry.processIndex] : null;
        
        return {
          title: entry.title,
          agentId: entry.agentIndex + 1,
          agentName: agent?.name || 'Unknown',
          agentColor: agent?.avatarColor || '#888',
          processId: entry.processIndex !== undefined ? entry.processIndex + 1 : null,
          processName: process?.name || entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
        };
      });
    }),
  }),

  // Schedule for week view
  schedule: router({
    byAgent: protectedProcedure.input(z.object({
      agentId: z.number(),
    })).query(({ input }) => {
      return seedScheduleEntries
        .filter(entry => entry.agentIndex === input.agentId - 1)
        .map((entry, index) => ({
          id: index + 1,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          processId: entry.processIndex !== undefined ? entry.processIndex + 1 : null,
        }));
    }),
    week: protectedProcedure.input(z.object({
      agentId: z.number().optional(),
      weekStart: z.string(),
    })).query(({ input }) => {
      // Return schedule entries for the week
      // For now, we repeat the daily schedule for each day
      const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
      
      const entries = input.agentId !== undefined
        ? seedScheduleEntries.filter(e => e.agentIndex === (input.agentId as number) - 1)
        : seedScheduleEntries;
      
      return days.map((day, dayIndex) => ({
        day,
        dayIndex,
        entries: entries.map((entry, index) => ({
          id: `${dayIndex}-${index}`,
          title: entry.title,
          startHour: entry.startHour,
          endHour: entry.endHour,
          color: entry.color,
          agentId: entry.agentIndex + 1,
          agentName: seedAgents[entry.agentIndex]?.name || 'Unknown',
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
});

export type AppRouter = typeof appRouter;
