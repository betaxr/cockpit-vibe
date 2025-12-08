/**
 * @fileoverview Team Service Layer
 * 
 * Provides database operations for teams with proper error handling.
 * Falls back to seed data if database is unavailable.
 * 
 * @module server/services/teams
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { teams } from "../../drizzle/schema";
import { seedTeams, seedAgents } from "../seedData";

export type TeamWithStats = {
  id: number;
  name: string;
  teamId: string;
  region: string | null;
  customerType: string | null;
  project: string | null;
  agentCount: number;
  color: string;
  status: "active" | "idle" | "busy";
};

/**
 * Get all teams with agent counts
 */
export async function getAllTeams(): Promise<TeamWithStats[]> {
  const db = await getDb();
  
  if (!db) {
    // Fallback to seed data
    console.warn("[TeamService] Database unavailable, using seed data");
    return seedTeams.map((team, index) => {
      const agentsInTeam = seedAgents.filter(a => a.teamIndex === index);
      const hasActiveAgent = agentsInTeam.some(a => a.status === "active");
      const hasBusyAgent = agentsInTeam.some(a => a.status === "busy");
      
      return {
        id: index + 1,
        name: team.name,
        teamId: team.teamId,
        region: team.region,
        customerType: team.customerType,
        project: team.project,
        agentCount: team.agentCount,
        color: team.color,
        status: hasBusyAgent ? "busy" : hasActiveAgent ? "active" : "idle",
      };
    });
  }

  try {
    const result = await db.select().from(teams);
    
    return result.map(team => ({
      id: team.id,
      name: team.name,
      teamId: team.teamId || `TEAM-${team.id}`,
      region: team.region,
      customerType: team.customerType,
      project: team.project,
      agentCount: team.agentCount || 0,
      color: "#f97316", // Default color
      status: "active" as const,
    }));
  } catch (error) {
    console.error("[TeamService] Failed to fetch teams:", error);
    // Fallback to seed data on error
    return seedTeams.map((team, index) => ({
      id: index + 1,
      name: team.name,
      teamId: team.teamId,
      region: team.region,
      customerType: team.customerType,
      project: team.project,
      agentCount: team.agentCount,
      color: team.color,
      status: "active" as const,
    }));
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(id: number): Promise<TeamWithStats | null> {
  const db = await getDb();
  
  if (!db) {
    const team = seedTeams[id - 1];
    if (!team) return null;
    
    return {
      id,
      name: team.name,
      teamId: team.teamId,
      region: team.region,
      customerType: team.customerType,
      project: team.project,
      agentCount: team.agentCount,
      color: team.color,
      status: "active",
    };
  }

  try {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    if (result.length === 0) return null;
    
    const team = result[0];
    return {
      id: team.id,
      name: team.name,
      teamId: team.teamId || `TEAM-${team.id}`,
      region: team.region,
      customerType: team.customerType,
      project: team.project,
      agentCount: team.agentCount || 0,
      color: "#f97316",
      status: "active",
    };
  } catch (error) {
    console.error("[TeamService] Failed to fetch team:", error);
    return null;
  }
}

/**
 * Get count of active teams
 */
export async function getActiveTeamCount(): Promise<number> {
  const teams = await getAllTeams();
  return teams.filter(t => t.status === "active" || t.status === "busy").length;
}
