/**
 * @fileoverview Agent Service Layer
 * 
 * Provides database operations for agents with proper error handling.
 * Falls back to seed data if database is unavailable.
 * 
 * @module server/services/agents
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { agents, teams } from "../../drizzle/schema";
import { seedAgents, seedTeams } from "../seedData";
import { THEME_COLORS } from "../../shared/themeColors";

export type AgentWithTeam = {
  id: number;
  name: string;
  agentId: string;
  teamId: number | null;
  hoursPerDay: number;
  status: "active" | "idle" | "offline" | "busy";
  avatarColor: string | null;
  skills: string | null;
  team?: {
    id: number;
    name: string;
    color: string;
  } | null;
};

/**
 * Get all agents with their team information
 */
export async function getAllAgents(): Promise<AgentWithTeam[]> {
  const db = await getDb();
  
  if (!db) {
    // Fallback to seed data
    console.warn("[AgentService] Database unavailable, using seed data");
    return seedAgents.map((agent, index) => {
      const team = seedTeams[agent.teamIndex];
      return {
        id: index + 1,
        name: agent.name,
        agentId: agent.agentId,
        teamId: team ? agent.teamIndex + 1 : null,
        hoursPerDay: agent.hoursPerDay,
        status: agent.status as "active" | "idle" | "offline" | "busy",
        avatarColor: agent.avatarColor,
        skills: null,
        team: team ? {
          id: agent.teamIndex + 1,
          name: team.name,
          color: team.color,
        } : null,
      };
    });
  }

  try {
    const result = await db.select().from(agents);
    const teamsData = await db.select().from(teams);
    
    return result.map(agent => {
      const team = teamsData.find(t => t.id === agent.teamId);
      return {
        ...agent,
        team: team ? {
          id: team.id,
          name: team.name,
      color: THEME_COLORS.primary, // Default color
        } : null,
      };
    });
  } catch (error) {
    console.error("[AgentService] Failed to fetch agents:", error);
    // Fallback to seed data on error
    return seedAgents.map((agent, index) => {
      const team = seedTeams[agent.teamIndex];
      return {
        id: index + 1,
        name: agent.name,
        agentId: agent.agentId,
        teamId: team ? agent.teamIndex + 1 : null,
        hoursPerDay: agent.hoursPerDay,
        status: agent.status as "active" | "idle" | "offline" | "busy",
        avatarColor: agent.avatarColor,
        skills: null,
        team: team ? {
          id: agent.teamIndex + 1,
          name: team.name,
          color: team.color,
        } : null,
      };
    });
  }
}

/**
 * Get agent by ID
 */
export async function getAgentById(id: number): Promise<AgentWithTeam | null> {
  const db = await getDb();
  
  if (!db) {
    const agent = seedAgents[id - 1];
    if (!agent) return null;
    
    const team = seedTeams[agent.teamIndex];
    return {
      id,
      name: agent.name,
      agentId: agent.agentId,
      teamId: team ? agent.teamIndex + 1 : null,
      hoursPerDay: agent.hoursPerDay,
      status: agent.status as "active" | "idle" | "offline" | "busy",
      avatarColor: agent.avatarColor,
      skills: null,
      team: team ? {
        id: agent.teamIndex + 1,
        name: team.name,
        color: team.color,
      } : null,
    };
  }

  try {
    const result = await db.select().from(agents).where(eq(agents.id, id));
    if (result.length === 0) return null;
    
    const agent = result[0];
    const teamsData = await db.select().from(teams).where(eq(teams.id, agent.teamId || 0));
    const team = teamsData[0];
    
    return {
      ...agent,
      team: team ? {
        id: team.id,
        name: team.name,
        color: "#f97316",
      } : null,
    };
  } catch (error) {
    console.error("[AgentService] Failed to fetch agent:", error);
    return null;
  }
}

/**
 * Get count of active agents
 */
export async function getActiveAgentCount(): Promise<number> {
  const agents = await getAllAgents();
  return agents.filter(a => a.status === "active" || a.status === "busy").length;
}
