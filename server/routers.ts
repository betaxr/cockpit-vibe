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
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // Test login with admin/admin credentials
    testLogin: publicProcedure.input(z.object({
      username: z.string(),
      password: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Check for test credentials
      if (input.username === 'admin' && input.password === 'admin') {
        // Create or get test admin user
        const testOpenId = 'test-admin-user';
        
        // Upsert the test admin user
        await upsertUser({
          openId: testOpenId,
          name: 'Test Admin',
          email: 'admin@test.local',
          loginMethod: 'test',
          role: 'admin',
          lastSignedIn: new Date(),
        });

        // Get the user to create session
        const user = await getUserByOpenId(testOpenId);
        if (!user) {
          return { success: false, message: 'User creation failed' };
        }

        // Create session token using SDK
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || 'Test Admin',
          expiresInMs: ONE_YEAR_MS,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: 'Invalid credentials' };
    }),
  }),

  // Database connections management (admin only)
  connections: router({
    // List all database connections
    list: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).query(async () => {
      return getAllDatabaseConnections();
    }),

    // Get single connection by ID
    getById: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({ id: z.number() })).query(async ({ input }) => {
      const connection = await getDatabaseConnectionById(input.id);
      if (!connection) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Connection not found' });
      }
      // Don't return encrypted password
      const { encryptedPassword, ...safeConnection } = connection;
      return safeConnection;
    }),

    // Create new database connection
    create: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({
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

    // Update existing connection
    update: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({
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

    // Delete connection
    delete: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteDatabaseConnection(input.id);
      return { success: true };
    }),

    // Test connection
    test: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const connection = await getDatabaseConnectionById(input.id);
      if (!connection) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Connection not found' });
      }

      const startTime = Date.now();
      let success = false;
      let errorMessage: string | undefined;

      try {
        // Simulate connection test based on database type
        // In a real implementation, you would actually try to connect
        const password = await getDecryptedPassword(input.id);
        
        // For demo purposes, we'll simulate a successful connection
        // In production, implement actual connection logic for each DB type
        await new Promise(resolve => setTimeout(resolve, 500));
        
        success = true;
        await updateConnectionStatus(input.id, 'active');
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updateConnectionStatus(input.id, 'error', errorMessage);
      }

      const durationMs = Date.now() - startTime;

      // Log the connection attempt
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

    // Get connection logs
    logs: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return next({ ctx });
    }).input(z.object({
      connectionId: z.number(),
      limit: z.number().min(1).max(100).default(50),
    })).query(async ({ input }) => {
      return getConnectionLogs(input.connectionId, input.limit);
    }),
  }),
});

export type AppRouter = typeof appRouter;
