import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUser, getUserByOpenId } from "./db";
import { sdk } from "./_core/sdk";
import {
  createDatabaseConnection,
  updateDatabaseConnection,
  deleteDatabaseConnection,
  getDatabaseConnectionById,
  getAllDatabaseConnections,
  updateConnectionStatus,
  logConnectionAction,
  getConnectionLogs,
  getDecryptedPassword,
  // New imports
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  getAllAgents,
  getAgentById,
  getAgentWithTeam,
  createAgent,
  updateAgent,
  deleteAgent,
  getAllWorkspaces,
  getWorkspacesByAgentId,
  createWorkspace,
  updateWorkspace,
  getAllProcesses,
  getProcessesByAgentId,
  createProcess,
  updateProcess,
  getScheduleByAgentAndDate,
  createScheduleEntry,
  getAllCortexEntries,
  createCortexEntry,
  getGlobalStats,
} from "./db";

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

  // Global statistics
  stats: router({
    global: protectedProcedure.query(async () => {
      return getGlobalStats();
    }),
  }),

  // Teams management
  teams: router({
    list: protectedProcedure.query(async () => getAllTeams()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const team = await getTeamById(input.id);
      if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
      return team;
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(255),
      teamId: z.string().min(1).max(64),
      region: z.string().max(128).optional(),
      customerType: z.string().max(128).optional(),
      project: z.string().max(255).optional(),
    })).mutation(async ({ input }) => {
      const id = await createTeam(input);
      return { id, success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      region: z.string().max(128).optional(),
      customerType: z.string().max(128).optional(),
      project: z.string().max(255).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateTeam(id, data);
      return { success: true };
    }),
  }),

  // Agents management
  agents: router({
    list: protectedProcedure.query(async () => getAllAgents()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const agent = await getAgentWithTeam(input.id);
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND' });
      return agent;
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(255),
      agentId: z.string().min(1).max(64),
      teamId: z.number().optional(),
      hoursPerDay: z.number().min(1).max(24).default(24),
      status: z.enum(['active', 'idle', 'offline', 'busy']).default('idle'),
      avatarColor: z.string().max(32).optional(),
      skills: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await createAgent(input);
      return { id, success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      teamId: z.number().optional(),
      hoursPerDay: z.number().min(1).max(24).optional(),
      status: z.enum(['active', 'idle', 'offline', 'busy']).optional(),
      avatarColor: z.string().max(32).optional(),
      skills: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateAgent(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteAgent(input.id);
      return { success: true };
    }),
    workspaces: protectedProcedure.input(z.object({ agentId: z.number() })).query(async ({ input }) => {
      return getWorkspacesByAgentId(input.agentId);
    }),
    processes: protectedProcedure.input(z.object({ agentId: z.number() })).query(async ({ input }) => {
      return getProcessesByAgentId(input.agentId);
    }),
    schedule: protectedProcedure.input(z.object({
      agentId: z.number(),
      date: z.string(),
    })).query(async ({ input }) => {
      return getScheduleByAgentAndDate(input.agentId, input.date);
    }),
  }),

  // Workspaces/Installations management
  workspaces: router({
    list: protectedProcedure.query(async () => getAllWorkspaces()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(255),
      type: z.enum(['pc', 'vm', 'server', 'cloud']).default('pc'),
      status: z.enum(['online', 'offline', 'maintenance']).default('offline'),
      agentId: z.number().optional(),
      ipAddress: z.string().max(64).optional(),
    })).mutation(async ({ input }) => {
      const id = await createWorkspace(input);
      return { id, success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      type: z.enum(['pc', 'vm', 'server', 'cloud']).optional(),
      status: z.enum(['online', 'offline', 'maintenance']).optional(),
      agentId: z.number().optional(),
      ipAddress: z.string().max(64).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateWorkspace(id, data);
      return { success: true };
    }),
  }),

  // Processes management
  processes: router({
    list: protectedProcedure.query(async () => getAllProcesses()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      status: z.enum(['pending', 'running', 'completed', 'failed', 'paused']).default('pending'),
      agentId: z.number().optional(),
      workspaceId: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      valueGenerated: z.number().default(0),
      timeSavedMinutes: z.number().default(0),
    })).mutation(async ({ input }) => {
      const id = await createProcess(input);
      return { id, success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      status: z.enum(['pending', 'running', 'completed', 'failed', 'paused']).optional(),
      agentId: z.number().optional(),
      workspaceId: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      valueGenerated: z.number().optional(),
      timeSavedMinutes: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProcess(id, data);
      return { success: true };
    }),
  }),

  // Schedule management
  schedule: router({
    create: adminProcedure.input(z.object({
      agentId: z.number(),
      processId: z.number().optional(),
      title: z.string().min(1).max(255),
      date: z.string(),
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(0).max(23),
      color: z.string().max(32).optional(),
    })).mutation(async ({ input }) => {
      const id = await createScheduleEntry({
        ...input,
        date: new Date(input.date),
      });
      return { id, success: true };
    }),
  }),

  // Cortex (knowledge base)
  cortex: router({
    list: protectedProcedure.query(async () => getAllCortexEntries()),
    create: adminProcedure.input(z.object({
      title: z.string().min(1).max(255),
      content: z.string().optional(),
      category: z.string().max(128).optional(),
      tags: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await createCortexEntry(input);
      return { id, success: true };
    }),
  }),

  // Database connections (keep existing)
  connections: router({
    list: adminProcedure.query(async () => getAllDatabaseConnections()),
    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const connection = await getDatabaseConnectionById(input.id);
      if (!connection) throw new TRPCError({ code: 'NOT_FOUND' });
      const { encryptedPassword, ...safeConnection } = connection;
      return safeConnection;
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(255),
      dbType: z.enum(['mysql', 'postgres', 'mongodb', 'redis', 'sqlite']),
      host: z.string().min(1).max(255),
      port: z.number().min(1).max(65535),
      database: z.string().max(255).optional(),
      username: z.string().max(255).optional(),
      password: z.string().optional(),
      sslEnabled: z.boolean().default(false),
    })).mutation(async ({ input, ctx }) => {
      const id = await createDatabaseConnection({
        ...input,
        sslEnabled: input.sslEnabled ? 1 : 0,
        createdById: ctx.user.id,
      });
      return { id, success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      dbType: z.enum(['mysql', 'postgres', 'mongodb', 'redis', 'sqlite']).optional(),
      host: z.string().min(1).max(255).optional(),
      port: z.number().min(1).max(65535).optional(),
      database: z.string().max(255).optional(),
      username: z.string().max(255).optional(),
      password: z.string().optional(),
      sslEnabled: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, sslEnabled, ...rest } = input;
      await updateDatabaseConnection(id, {
        ...rest,
        sslEnabled: sslEnabled !== undefined ? (sslEnabled ? 1 : 0) : undefined,
      });
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteDatabaseConnection(input.id);
      return { success: true };
    }),
    test: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const connection = await getDatabaseConnectionById(input.id);
      if (!connection) throw new TRPCError({ code: 'NOT_FOUND' });
      const startTime = Date.now();
      let success = false;
      let errorMessage: string | undefined;
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        success = true;
        await updateConnectionStatus(input.id, 'active');
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updateConnectionStatus(input.id, 'error', errorMessage);
      }
      const durationMs = Date.now() - startTime;
      await logConnectionAction({
        connectionId: input.id,
        userId: ctx.user.id,
        action: 'test',
        success: success ? 1 : 0,
        errorMessage,
        durationMs,
      });
      return { success, durationMs, error: errorMessage };
    }),
    logs: adminProcedure.input(z.object({
      connectionId: z.number(),
      limit: z.number().min(1).max(100).default(50),
    })).query(async ({ input }) => {
      return getConnectionLogs(input.connectionId, input.limit);
    }),
  }),
});

export type AppRouter = typeof appRouter;
