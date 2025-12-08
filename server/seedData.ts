/**
 * @fileoverview Narrative Seed Data for Cockpit Vibe Agent Management System
 * 
 * This module provides realistic mock data representing a pharmacy chain
 * ("Einhorn Apotheke") with multiple teams, agents, processes, and workspaces.
 * 
 * **Data Structure:**
 * - Teams: Organizational units (Marketing, Verkauf, Logistik, Support, Production)
 * - Agents: Team representatives (identified by team name)
 * - Workspaces: Physical/virtual machines where agents work
 * - Processes: Automated tasks with success/failure statistics
 * - Schedule: 24-hour schedule entries linking agents to processes
 * 
 * **Color Coding:** uses theme variables (no hardcoded hex)
 * 
 * @module server/seedData
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { THEME_COLORS } from "../shared/themeColors";

// Teams - Organizational units (each team has 1-5 agents)
export const seedTeams = [
  {
    name: "Marketing",
    teamId: "TEAM-MKT-001",
    region: "DACH",
    customerType: "B2B, Partner",
    project: "Social Media & Kampagnen",
    agentCount: 3,
    color: THEME_COLORS.amber,
  },
  {
    name: "Verkauf",
    teamId: "TEAM-SALES-001",
    region: "Deutschland Süd",
    customerType: "B2C, Endkunden",
    project: "Kundenberatung & Verkauf",
    agentCount: 2,
    color: THEME_COLORS.primary,
  },
  {
    name: "Logistik",
    teamId: "TEAM-LOG-001",
    region: "Deutschland",
    customerType: "Intern",
    project: "Wareneingang & Versand",
    agentCount: 4,
    color: THEME_COLORS.success,
  },
  {
    name: "Support",
    teamId: "TEAM-SUP-001",
    region: "Europa",
    customerType: "B2C, Reklamationen",
    project: "Kundenservice & Retouren",
    agentCount: 2,
    color: THEME_COLORS.info,
  },
  {
    name: "Production",
    teamId: "TEAM-PROD-001",
    region: "Deutschland",
    customerType: "Intern",
    project: "Herstellung & Qualität",
    agentCount: 5,
    color: THEME_COLORS.pink,
  },
];

// Agents - Now identified by team, not individual names
export const seedAgents = [
  {
    name: "Marketing", // Team name as identifier
    agentId: "AGT-MKT-001",
    teamIndex: 0,
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: THEME_COLORS.amber,
    agentCount: 3, // 3 agents in this team
    capabilities: ["Social Media", "Content Creation", "Analytics"],
  },
  {
    name: "Verkauf",
    agentId: "AGT-SALES-001",
    teamIndex: 1,
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: THEME_COLORS.primary,
    agentCount: 2,
    capabilities: ["Beratung", "Produktsuche", "Bestellungen"],
  },
  {
    name: "Logistik",
    agentId: "AGT-LOG-001",
    teamIndex: 2,
    status: "busy" as const,
    hoursPerDay: 24,
    avatarColor: THEME_COLORS.success,
    agentCount: 4,
    capabilities: ["Inventur", "Versandvorbereitung", "Tracking"],
  },
  {
    name: "Support",
    agentId: "AGT-SUP-001",
    teamIndex: 3,
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: THEME_COLORS.info,
    agentCount: 2,
    capabilities: ["Ticketbearbeitung", "Retouren", "FAQ"],
  },
  {
    name: "Production",
    agentId: "AGT-PROD-001",
    teamIndex: 4,
    status: "idle" as const,
    hoursPerDay: 12,
    avatarColor: THEME_COLORS.pink,
    agentCount: 5,
    capabilities: ["Herstellung", "Qualitätskontrolle", "Dokumentation"],
  },
];

// Workspaces - Physical/Virtual machines where teams work
export const seedWorkspaces = [
  {
    name: "Marketing-VM",
    workspaceId: "WS-MKT-001",
    type: "virtual" as const,
    status: "online" as const,
    location: "Cloud Azure",
    agentIndex: 0,
  },
  {
    name: "Apotheken-Terminal 1",
    workspaceId: "WS-APO-001",
    type: "physical" as const,
    status: "online" as const,
    location: "Filiale München",
    agentIndex: 1,
  },
  {
    name: "Lager-Terminal",
    workspaceId: "WS-LOG-001",
    type: "physical" as const,
    status: "online" as const,
    location: "Zentrallager",
    agentIndex: 2,
  },
  {
    name: "Support-Workstation",
    workspaceId: "WS-SUP-001",
    type: "virtual" as const,
    status: "online" as const,
    location: "Cloud AWS",
    agentIndex: 3,
  },
  {
    name: "Produktions-Terminal",
    workspaceId: "WS-PROD-001",
    type: "physical" as const,
    status: "offline" as const,
    location: "Werk Stuttgart",
    agentIndex: 4,
  },
];

// Processes - Automated tasks that teams execute
export const seedProcesses = [
  {
    name: "Social Media Posting",
    processId: "PROC-SM-001",
    description: "Automatisches Posten auf Instagram, Facebook und LinkedIn",
    category: "Marketing",
    estimatedMinutes: 15,
    valuePerRun: 2500,
    agentIndex: 0,
    scheduleCount: 156,
    successCount: 148,
    failCount: 8,
  },
  {
    name: "Bestellbestätigung",
    processId: "PROC-ORD-001",
    description: "Versand von Bestellbestätigungen per E-Mail",
    category: "Verkauf",
    estimatedMinutes: 5,
    valuePerRun: 500,
    agentIndex: 1,
    scheduleCount: 1247,
    successCount: 1241,
    failCount: 6,
  },
  {
    name: "Inventur-Check",
    processId: "PROC-INV-001",
    description: "Tägliche Bestandsprüfung und Nachbestellungen",
    category: "Logistik",
    estimatedMinutes: 45,
    valuePerRun: 15000,
    agentIndex: 2,
    scheduleCount: 89,
    successCount: 87,
    failCount: 2,
  },
  {
    name: "Ticket-Triage",
    processId: "PROC-TKT-001",
    description: "Automatische Kategorisierung und Priorisierung von Support-Tickets",
    category: "Support",
    estimatedMinutes: 10,
    valuePerRun: 1000,
    agentIndex: 3,
    scheduleCount: 523,
    successCount: 498,
    failCount: 25,
  },
  {
    name: "Retouren-Verarbeitung",
    processId: "PROC-RET-001",
    description: "Bearbeitung von Rücksendungen und Erstattungen",
    category: "Support",
    estimatedMinutes: 20,
    valuePerRun: 3000,
    agentIndex: 3,
    scheduleCount: 234,
    successCount: 229,
    failCount: 5,
  },
  {
    name: "Preisvergleich",
    processId: "PROC-PRC-001",
    description: "Wettbewerbsanalyse und Preisanpassungen",
    category: "Verkauf",
    estimatedMinutes: 30,
    valuePerRun: 5000,
    agentIndex: 1,
    scheduleCount: 62,
    successCount: 60,
    failCount: 2,
  },
  {
    name: "Newsletter-Versand",
    processId: "PROC-NL-001",
    description: "Wöchentlicher Newsletter an Abonnenten",
    category: "Marketing",
    estimatedMinutes: 25,
    valuePerRun: 8000,
    agentIndex: 0,
    scheduleCount: 48,
    successCount: 47,
    failCount: 1,
  },
  {
    name: "Versandvorbereitung",
    processId: "PROC-SHP-001",
    description: "Erstellung von Versandlabels und Packzettel",
    category: "Logistik",
    estimatedMinutes: 8,
    valuePerRun: 200,
    agentIndex: 2,
    scheduleCount: 2156,
    successCount: 2134,
    failCount: 22,
  },
];

// Schedule entries - What teams do throughout the day
export const seedScheduleEntries = [
  // Marketing (Agent 0)
  { agentIndex: 0, title: "Social Media Posting", startHour: 7, endHour: 8, color: THEME_COLORS.primary, processIndex: 0 },
  { agentIndex: 0, title: "Content Creation", startHour: 9, endHour: 11, color: THEME_COLORS.muted },
  { agentIndex: 0, title: "Social Media Posting", startHour: 12, endHour: 13, color: THEME_COLORS.primary, processIndex: 0 },
  { agentIndex: 0, title: "Analytics Review", startHour: 14, endHour: 15, color: THEME_COLORS.accent },
  { agentIndex: 0, title: "Newsletter-Versand", startHour: 16, endHour: 17, color: THEME_COLORS.amber, processIndex: 6 },
  { agentIndex: 0, title: "Social Media Posting", startHour: 18, endHour: 19, color: THEME_COLORS.primary, processIndex: 0 },
  
  // Verkauf (Agent 1)
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 0, endHour: 1, color: THEME_COLORS.primary, processIndex: 1 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 3, endHour: 4, color: THEME_COLORS.primary, processIndex: 1 },
  { agentIndex: 1, title: "Preisvergleich", startHour: 6, endHour: 7, color: THEME_COLORS.accent, processIndex: 5 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 9, endHour: 10, color: THEME_COLORS.primary, processIndex: 1 },
  { agentIndex: 1, title: "Kundenberatung", startHour: 10, endHour: 12, color: THEME_COLORS.muted },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 14, endHour: 15, color: THEME_COLORS.primary, processIndex: 1 },
  { agentIndex: 1, title: "Preisvergleich", startHour: 18, endHour: 19, color: THEME_COLORS.accent, processIndex: 5 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 21, endHour: 22, color: THEME_COLORS.primary, processIndex: 1 },
  
  // Logistik (Agent 2)
  { agentIndex: 2, title: "Inventur-Check", startHour: 5, endHour: 6, color: THEME_COLORS.success, processIndex: 2 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 7, endHour: 9, color: THEME_COLORS.primary, processIndex: 7 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 10, endHour: 12, color: THEME_COLORS.primary, processIndex: 7 },
  { agentIndex: 2, title: "Wareneingang", startHour: 13, endHour: 15, color: THEME_COLORS.muted },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 16, endHour: 18, color: THEME_COLORS.primary, processIndex: 7 },
  { agentIndex: 2, title: "Inventur-Check", startHour: 20, endHour: 21, color: THEME_COLORS.success, processIndex: 2 },
  
  // Support (Agent 3)
  { agentIndex: 3, title: "Ticket-Triage", startHour: 8, endHour: 9, color: THEME_COLORS.info, processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 9, endHour: 11, color: THEME_COLORS.accent, processIndex: 4 },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 12, endHour: 13, color: THEME_COLORS.info, processIndex: 3 },
  { agentIndex: 3, title: "Kundenservice", startHour: 14, endHour: 16, color: THEME_COLORS.muted },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 17, endHour: 18, color: THEME_COLORS.info, processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 19, endHour: 20, color: THEME_COLORS.accent, processIndex: 4 },
];

// Helper to get process reliability
export function getProcessReliability(process: typeof seedProcesses[0]): number {
  if (process.scheduleCount === 0) return 100;
  return Math.round((process.successCount / process.scheduleCount) * 100);
}

// Helper to get total value generated by a process
export function getProcessTotalValue(process: typeof seedProcesses[0]): number {
  return process.successCount * process.valuePerRun;
}

// Helper to get agent's current process
export function getAgentCurrentProcess(agentIndex: number, hour: number): typeof seedScheduleEntries[0] | undefined {
  return seedScheduleEntries.find(
    entry => entry.agentIndex === agentIndex && entry.startHour <= hour && entry.endHour > hour
  );
}

// Calculate global stats
export function getGlobalStats() {
  const activeAgents = seedAgents.filter(a => a.status === 'active' || a.status === 'busy').length;
  const totalAgents = seedAgents.reduce((sum, a) => sum + (a.agentCount || 1), 0);
  
  const currentHour = new Date().getHours();
  const runningProcesses = seedScheduleEntries.filter(
    entry => entry.startHour <= currentHour && entry.endHour > currentHour
  ).length;
  
  const totalValue = seedProcesses.reduce((sum, p) => sum + getProcessTotalValue(p), 0);
  const totalTimeSaved = seedProcesses.reduce((sum, p) => sum + (p.successCount * p.estimatedMinutes), 0);
  
  return {
    activeAgents,
    totalAgents,
    runningProcesses,
    totalProcesses: seedProcesses.length,
    totalValue: Math.round(totalValue / 100), // in euros
    totalTimeSaved: Math.round(totalTimeSaved / 60), // in hours
    avgReliability: Math.round(
      seedProcesses.reduce((sum, p) => sum + getProcessReliability(p), 0) / seedProcesses.length
    ),
  };
}
