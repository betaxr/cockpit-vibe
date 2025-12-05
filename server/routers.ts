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

/** Session token expiration time: 1 year in milliseconds */
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Admin-only procedure middleware.
 * Ensures only users with 'admin' role can access protected endpoints.
 * 
 * @throws {TRPCError} FORBIDDEN - If user does not have admin role
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

/**
 * Main Application Router
 * 
 * Organized into the following sub-routers:
 * - system: Health checks and system status
 * - auth: Authentication (login, logout, session management)
 * - stats: Global statistics and KPIs
 * - teams: Team management (Marketing, Verkauf, Logistik, Support, Production)
 * - agents: Agent management, schedules, and current processes
 * - workspaces: Workspace/installation management
 * - processes: Process management with reliability statistics
 * - schedule: Weekly and daily schedule views
 * - cortex: Knowledge base entries
 */
export const appRouter = router({
  /** System health and status endpoints */
  system: systemRouter,
  
  /**
   * Authentication Router
   * 
   * Handles user authentication, session management, and test login.
   * Uses cookie-based sessions with JWT tokens.
   */
  auth: router({
    /**
     * Get current authenticated user.
     * @returns User object or null if not authenticated
     */
    me: publicProcedure.query(opts => opts.ctx.user),
    
    /**
     * Logout current user.
     * Clears the session cookie and invalidates the session.
     * @returns Object with success: true
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    /**
     * Test login endpoint for development purposes.
     * Accepts admin/admin credentials for testing.
     * 
     * @param input.username - Username (must be 'admin' for test login)
     * @param input.password - Password (must be 'admin' for test login)
     * @returns Object with success boolean and message
     * 
     * @example
     * // Successful login
     * const result = await trpc.auth.testLogin.mutate({ username: 'admin', password: 'admin' });
     * // { success: true, message: 'Login successful' }
     */
    testLogin: publicProcedure.input(z.object({
      username: z.string(),
      password: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Only accept admin/admin for test purposes
      if (input.username === 'admin' && input.password === 'admin') {
        const testOpenId = 'test-admin-user';
        
        // Create or update test admin user
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
        
        // Create session token with 1 year expiration
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

  /**
   * Statistics Router
   * 
   * Provides global KPIs and metrics for the dashboard.
   * Aggregates data from all teams, agents, and processes.
   */
  stats: router({
    /**
     * Get global statistics for the dashboard.
     * @returns Object containing:
     *   - processCount: Total number of processes
     *   - totalValue: Total value generated (in EUR)
     *   - totalTimeSaved: Total time saved (in hours)
     *   - utilization: Overall system utilization percentage
     *   - activeAgents: Number of currently active agents
     *   - totalAgents: Total number of agents
     *   - runningProcesses: Number of currently running processes
     */
    global: protectedProcedure.query(() => {
      return getSeedGlobalStats();
    }),
  }),

  /**
   * Teams Router
   * 
   * Manages team data. Teams represent departments or functional groups
   * that contain multiple agents working together.
   */
  teams: router({
    /**
     * List all teams.
     * @returns Array of team objects with id, name, agentCount, hoursPerDay, status
     */
    list: protectedProcedure.query(() => {
      return seedTeams.map((team, index) => ({
        id: index + 1,
        ...team,
      }));
    }),
    
    /**
     * Get a specific team by ID.
     * @param input.id - Team ID (1-based index)
     * @returns Team object
     * @throws {TRPCError} NOT_FOUND - If team doesn't exist
     */
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
      const team = seedTeams[input.id - 1];
      if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
      return { id: input.id, ...team };
    }),
  }),

  /**
   * Agents Router
   * 
   * Manages AI agents. Each agent belongs to a team and can handle
   * multiple processes on assigned workspaces.
   */
  agents: router({
    /**
     * List all agents with their team information.
     * @returns Array of agent objects including team data
     */
    list: protectedProcedure.query(() => {
      return seedAgents.map((agent, index) => ({
        id: index + 1,
        ...agent,
        team: seedTeams[agent.teamIndex],
      }));
    }),
    
    /**
     * Get a specific agent by ID.
     * @param input.id - Agent ID (1-based index)
     * @returns Agent object with team information
     * @throws {TRPCError} NOT_FOUND - If agent doesn't exist
     */
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
      const agent = seedAgents[input.id - 1];
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND' });
      return {
        id: input.id,
        ...agent,
        team: seedTeams[agent.teamIndex],
      };
    }),
    
    /**
     * Get workspaces assigned to an agent.
     * @param input.agentId - Agent ID (1-based index)
     * @returns Array of workspace objects
     */
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
    
    /**
     * Get processes handled by an agent.
     * @param input.agentId - Agent ID (1-based index)
     * @returns Array of process objects with statistics
     */
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
    
    /**
     * Get agent's schedule for a specific date.
     * @param input.agentId - Agent ID (1-based index)
     * @param input.date - Date string (ISO format, currently unused - returns daily schedule)
     * @returns Array of schedule entries with time slots
     */
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
    
    /**
     * Get agent's currently running process.
     * @param input.agentId - Agent ID (1-based index)
     * @returns Current process entry or null if agent is idle
     */
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

  /**
   * Workspaces Router
   * 
   * Manages workspaces (installations/machines) where agents execute processes.
   * Each workspace is assigned to an agent and has a status.
   */
  workspaces: router({
    /**
     * List all workspaces with assigned agent information.
     * @returns Array of workspace objects including agent data
     */
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

  /**
   * Processes Router
   * 
   * Manages automated processes with statistics.
   * Tracks reliability, value generation, and current running status.
   */
  processes: router({
    /**
     * List all processes with statistics and current status.
     * @returns Array of process objects including:
     *   - reliability: Success rate percentage
     *   - totalValue: Total value generated
     *   - totalTimeSaved: Total time saved in minutes
     *   - status: 'running' or 'idle'
     *   - agent: Assigned agent information
     */
    list: protectedProcedure.query(() => {
      const currentHour = new Date().getHours();
      
      return seedProcesses.map((p, index) => {
        const agent = seedAgents[p.agentIndex];
        
        // Check if process is currently running based on schedule
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
    
    /**
     * Get currently running processes.
     * @returns Array of running process entries with agent information
     */
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

  /**
   * Schedule Router
   * 
   * Provides schedule views for agents (daily and weekly).
   * Used for the Wochenplan (weekly schedule) view.
   */
  schedule: router({
    /**
     * Get schedule entries for a specific agent.
     * @param input.agentId - Agent ID (1-based index)
     * @returns Array of schedule entries
     */
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
    
    /**
     * Get weekly schedule view.
     * Returns schedule entries organized by day of the week.
     * 
     * @param input.agentId - Optional agent ID to filter by
     * @param input.weekStart - Week start date (ISO format)
     * @returns Array of day objects, each containing schedule entries
     */
    week: protectedProcedure.input(z.object({
      agentId: z.number().optional(),
      weekStart: z.string(),
    })).query(({ input }) => {
      const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
      
      // Filter entries by agent if specified
      const entries = input.agentId !== undefined
        ? seedScheduleEntries.filter(e => e.agentIndex === (input.agentId as number) - 1)
        : seedScheduleEntries;
      
      // Map entries to each day of the week
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

  /**
   * Cortex Router
   * 
   * Knowledge base for documentation and guidelines.
   * Contains process documentation, team guidelines, and best practices.
   */
  cortex: router({
    /**
     * List all knowledge base entries.
     * @returns Array of cortex entries with title, content, category, and tags
     */
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

/** Type export for client-side type inference */
export type AppRouter = typeof appRouter;
