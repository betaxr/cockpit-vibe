/**
 * @fileoverview Narrative Seed Data for the Cockpit Vibe Agent Management System
 * 
 * This file contains realistic mock data representing an enterprise automation system
 * with multiple teams, agents, processes, and workspaces. The data structure follows
 * a narrative approach where teams are the primary organizational unit.
 * 
 * **Data Model Overview:**
 * - Teams: Organizational units (Marketing, Verkauf, Logistik, Support, Production)
 * - Agents: AI agents grouped by team (1-5 agents per team)
 * - Workspaces: Physical/virtual machines where agents execute processes
 * - Processes: Automated tasks with reliability tracking and value metrics
 * - Schedule Entries: Time-based assignments of processes to agents
 * 
 * **Process Status Color System:**
 * The system uses a 5-color scheme to visualize process types:
 * - Neon-Orange (#c2410c): Regular automated processes (Reguläre Auslastung)
 * - Light-Orange (#a16207): Semi-automated processes (Teilautomatisiert)
 * - White (#ffffff): New test processes (Neue Test Prozesse)
 * - Gray (#78716c): Planned processes (Geplante Prozesse)
 * - Transparent Gray-Black: Remaining capacity (Restkapazitäten)
 * 
 * @module server/seedData
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

/**
 * Team Interface
 * Represents an organizational unit containing multiple agents
 */
interface Team {
  /** Display name of the team */
  name: string;
  /** Unique identifier for the team */
  teamId: string;
  /** Geographic region of operation */
  region: string;
  /** Type of customers served */
  customerType: string;
  /** Current project or focus area */
  project: string;
  /** Number of agents in this team */
  agentCount: number;
  /** Theme color for UI representation */
  color: string;
}

/**
 * Agent Status Type
 * Represents the current operational state of an agent
 */
type AgentStatus = 'active' | 'busy' | 'idle';

/**
 * Agent Interface
 * Represents an AI agent or team of agents
 */
interface Agent {
  /** Team name as identifier (narrative approach) */
  name: string;
  /** Unique agent identifier */
  agentId: string;
  /** Index reference to parent team */
  teamIndex: number;
  /** Current operational status */
  status: AgentStatus;
  /** Available hours per day (typically 24 for AI agents) */
  hoursPerDay: number;
  /** Avatar color for UI representation */
  avatarColor: string;
  /** Number of individual agents in this team unit */
  agentCount: number;
  /** List of capabilities/skills */
  capabilities: string[];
}

/**
 * Workspace Type
 * Distinguishes between physical and virtual workspaces
 */
type WorkspaceType = 'physical' | 'virtual';

/**
 * Workspace Status Type
 * Represents the current availability of a workspace
 */
type WorkspaceStatus = 'online' | 'offline';

/**
 * Workspace Interface
 * Represents a physical or virtual machine where agents execute processes
 */
interface Workspace {
  /** Display name of the workspace */
  name: string;
  /** Unique workspace identifier */
  workspaceId: string;
  /** Type of workspace (physical/virtual) */
  type: WorkspaceType;
  /** Current availability status */
  status: WorkspaceStatus;
  /** Physical or cloud location */
  location: string;
  /** Index reference to assigned agent */
  agentIndex: number;
}

/**
 * Process Interface
 * Represents an automated task with tracking metrics
 */
interface Process {
  /** Display name of the process */
  name: string;
  /** Unique process identifier */
  processId: string;
  /** Detailed description of what the process does */
  description: string;
  /** Category/department classification */
  category: string;
  /** Estimated duration per run in minutes */
  estimatedMinutes: number;
  /** Value generated per successful run in cents */
  valuePerRun: number;
  /** Index reference to assigned agent */
  agentIndex: number;
  /** Total number of scheduled executions */
  scheduleCount: number;
  /** Number of successful executions */
  successCount: number;
  /** Number of failed executions */
  failCount: number;
}

/**
 * Schedule Entry Interface
 * Represents a time slot assignment for an agent
 */
interface ScheduleEntry {
  /** Index reference to assigned agent */
  agentIndex: number;
  /** Display title for the time slot */
  title: string;
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (0-24) */
  endHour: number;
  /** Color code for visualization (see Process Status Color System) */
  color: string;
  /** Optional index reference to associated process */
  processIndex?: number;
}

// ============================================================================
// TEAMS DATA
// ============================================================================

/**
 * Teams - Primary organizational units
 * 
 * Each team represents a department with specific responsibilities:
 * - Marketing: Social media, campaigns, content creation
 * - Verkauf: Sales, customer consultation, orders
 * - Logistik: Inventory, shipping, warehouse operations
 * - Support: Customer service, tickets, returns
 * - Production: Manufacturing, quality control
 */
export const seedTeams: Team[] = [
  {
    name: "Marketing",
    teamId: "TEAM-MKT-001",
    region: "DACH",
    customerType: "B2B, Partner",
    project: "Social Media & Kampagnen",
    agentCount: 3,
    color: "#eab308",
  },
  {
    name: "Verkauf",
    teamId: "TEAM-SALES-001",
    region: "Deutschland Süd",
    customerType: "B2C, Endkunden",
    project: "Kundenberatung & Verkauf",
    agentCount: 2,
    color: "#f97316",
  },
  {
    name: "Logistik",
    teamId: "TEAM-LOG-001",
    region: "Deutschland",
    customerType: "Intern",
    project: "Wareneingang & Versand",
    agentCount: 4,
    color: "#22c55e",
  },
  {
    name: "Support",
    teamId: "TEAM-SUP-001",
    region: "Europa",
    customerType: "B2C, Reklamationen",
    project: "Kundenservice & Retouren",
    agentCount: 2,
    color: "#3b82f6",
  },
  {
    name: "Production",
    teamId: "TEAM-PROD-001",
    region: "Deutschland",
    customerType: "Intern",
    project: "Herstellung & Qualität",
    agentCount: 5,
    color: "#ec4899",
  },
];

// ============================================================================
// AGENTS DATA
// ============================================================================

/**
 * Agents - AI agents grouped by team
 * 
 * In the narrative approach, agents are identified by their team name
 * rather than individual names. Each entry represents a team unit
 * that may contain multiple individual agents (agentCount).
 */
export const seedAgents: Agent[] = [
  {
    name: "Marketing",
    agentId: "AGT-MKT-001",
    teamIndex: 0,
    status: "active",
    hoursPerDay: 24,
    avatarColor: "#eab308",
    agentCount: 3,
    capabilities: ["Social Media", "Content Creation", "Analytics"],
  },
  {
    name: "Verkauf",
    agentId: "AGT-SALES-001",
    teamIndex: 1,
    status: "active",
    hoursPerDay: 24,
    avatarColor: "#f97316",
    agentCount: 2,
    capabilities: ["Beratung", "Produktsuche", "Bestellungen"],
  },
  {
    name: "Logistik",
    agentId: "AGT-LOG-001",
    teamIndex: 2,
    status: "busy",
    hoursPerDay: 24,
    avatarColor: "#22c55e",
    agentCount: 4,
    capabilities: ["Inventur", "Versandvorbereitung", "Tracking"],
  },
  {
    name: "Support",
    agentId: "AGT-SUP-001",
    teamIndex: 3,
    status: "active",
    hoursPerDay: 24,
    avatarColor: "#3b82f6",
    agentCount: 2,
    capabilities: ["Ticketbearbeitung", "Retouren", "FAQ"],
  },
  {
    name: "Production",
    agentId: "AGT-PROD-001",
    teamIndex: 4,
    status: "idle",
    hoursPerDay: 12,
    avatarColor: "#ec4899",
    agentCount: 5,
    capabilities: ["Herstellung", "Qualitätskontrolle", "Dokumentation"],
  },
];

// ============================================================================
// WORKSPACES DATA
// ============================================================================

/**
 * Workspaces - Physical and virtual machines
 * 
 * Each workspace represents an installation where agents execute processes.
 * Types include:
 * - Virtual: Cloud-based VMs (Azure, AWS)
 * - Physical: On-premise terminals and workstations
 */
export const seedWorkspaces: Workspace[] = [
  {
    name: "Marketing-VM",
    workspaceId: "WS-MKT-001",
    type: "virtual",
    status: "online",
    location: "Cloud Azure",
    agentIndex: 0,
  },
  {
    name: "Apotheken-Terminal 1",
    workspaceId: "WS-APO-001",
    type: "physical",
    status: "online",
    location: "Filiale München",
    agentIndex: 1,
  },
  {
    name: "Lager-Terminal",
    workspaceId: "WS-LOG-001",
    type: "physical",
    status: "online",
    location: "Zentrallager",
    agentIndex: 2,
  },
  {
    name: "Support-Workstation",
    workspaceId: "WS-SUP-001",
    type: "virtual",
    status: "online",
    location: "Cloud AWS",
    agentIndex: 3,
  },
  {
    name: "Produktions-Terminal",
    workspaceId: "WS-PROD-001",
    type: "physical",
    status: "offline",
    location: "Werk Stuttgart",
    agentIndex: 4,
  },
];

// ============================================================================
// PROCESSES DATA
// ============================================================================

/**
 * Processes - Automated tasks with tracking metrics
 * 
 * Each process represents an automated workflow that agents execute.
 * Metrics tracked:
 * - scheduleCount: Total scheduled executions
 * - successCount: Successful completions
 * - failCount: Failed executions
 * - valuePerRun: Value generated per successful run (in cents)
 * - estimatedMinutes: Expected duration per run
 */
export const seedProcesses: Process[] = [
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

// ============================================================================
// SCHEDULE ENTRIES DATA
// ============================================================================

/**
 * Schedule Entries - Time-based process assignments
 * 
 * Defines what each agent does throughout the day.
 * 
 * **Color Coding (Process Status System):**
 * - #c2410c (Neon-Orange): Regular automated processes
 * - #a16207 (Light-Orange): Semi-automated processes
 * - #78716c (Gray): Planned/manual processes
 * - #22c55e (Green): Logistik-specific processes
 * - #3b82f6 (Blue): Support-specific processes
 * - #eab308 (Yellow): Marketing-specific processes
 */
export const seedScheduleEntries: ScheduleEntry[] = [
  // Marketing (Agent 0) - Social media and content throughout the day
  { agentIndex: 0, title: "Social Media Posting", startHour: 7, endHour: 8, color: "#c2410c", processIndex: 0 },
  { agentIndex: 0, title: "Content Creation", startHour: 9, endHour: 11, color: "#78716c" },
  { agentIndex: 0, title: "Social Media Posting", startHour: 12, endHour: 13, color: "#c2410c", processIndex: 0 },
  { agentIndex: 0, title: "Analytics Review", startHour: 14, endHour: 15, color: "#a16207" },
  { agentIndex: 0, title: "Newsletter-Versand", startHour: 16, endHour: 17, color: "#eab308", processIndex: 6 },
  { agentIndex: 0, title: "Social Media Posting", startHour: 18, endHour: 19, color: "#c2410c", processIndex: 0 },
  
  // Verkauf (Agent 1) - Order processing and customer consultation
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 0, endHour: 1, color: "#c2410c", processIndex: 1 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 3, endHour: 4, color: "#c2410c", processIndex: 1 },
  { agentIndex: 1, title: "Preisvergleich", startHour: 6, endHour: 7, color: "#a16207", processIndex: 5 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 9, endHour: 10, color: "#c2410c", processIndex: 1 },
  { agentIndex: 1, title: "Kundenberatung", startHour: 10, endHour: 12, color: "#78716c" },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 14, endHour: 15, color: "#c2410c", processIndex: 1 },
  { agentIndex: 1, title: "Preisvergleich", startHour: 18, endHour: 19, color: "#a16207", processIndex: 5 },
  { agentIndex: 1, title: "Bestellbestätigung", startHour: 21, endHour: 22, color: "#c2410c", processIndex: 1 },
  
  // Logistik (Agent 2) - Inventory and shipping operations
  { agentIndex: 2, title: "Inventur-Check", startHour: 5, endHour: 6, color: "#22c55e", processIndex: 2 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 7, endHour: 9, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 10, endHour: 12, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Wareneingang", startHour: 13, endHour: 15, color: "#78716c" },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 16, endHour: 18, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Inventur-Check", startHour: 20, endHour: 21, color: "#22c55e", processIndex: 2 },
  
  // Support (Agent 3) - Ticket handling and returns processing
  { agentIndex: 3, title: "Ticket-Triage", startHour: 8, endHour: 9, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 9, endHour: 11, color: "#a16207", processIndex: 4 },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 12, endHour: 13, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Kundenservice", startHour: 14, endHour: 16, color: "#78716c" },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 17, endHour: 18, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 19, endHour: 20, color: "#a16207", processIndex: 4 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate process reliability percentage
 * 
 * Reliability = (successCount / scheduleCount) * 100
 * 
 * @param process - Process object with execution statistics
 * @returns Reliability percentage (0-100), rounded to nearest integer
 * 
 * @example
 * const reliability = getProcessReliability(process);
 * // Returns 95 for a process with 95 successes out of 100 schedules
 */
export function getProcessReliability(process: Process): number {
  if (process.scheduleCount === 0) return 100;
  return Math.round((process.successCount / process.scheduleCount) * 100);
}

/**
 * Calculate total value generated by a process
 * 
 * Total Value = successCount * valuePerRun
 * 
 * @param process - Process object with execution statistics
 * @returns Total value in cents
 * 
 * @example
 * const totalValue = getProcessTotalValue(process);
 * // Returns 250000 for a process with 100 successes at 2500 cents each
 */
export function getProcessTotalValue(process: Process): number {
  return process.successCount * process.valuePerRun;
}

/**
 * Get agent's currently running process based on time
 * 
 * Finds the schedule entry that covers the specified hour
 * for the given agent.
 * 
 * @param agentIndex - Index of the agent (0-based)
 * @param hour - Current hour (0-23)
 * @returns Schedule entry if found, undefined otherwise
 * 
 * @example
 * const currentProcess = getAgentCurrentProcess(0, 14);
 * // Returns the schedule entry for agent 0 at 2 PM
 */
export function getAgentCurrentProcess(agentIndex: number, hour: number): ScheduleEntry | undefined {
  return seedScheduleEntries.find(
    entry => entry.agentIndex === agentIndex && entry.startHour <= hour && entry.endHour > hour
  );
}

/**
 * Global Statistics Interface
 * Represents aggregated metrics across all teams and processes
 */
interface GlobalStats {
  /** Number of agents with 'active' or 'busy' status */
  activeAgents: number;
  /** Total number of individual agents across all teams */
  totalAgents: number;
  /** Number of processes currently running */
  runningProcesses: number;
  /** Total number of defined processes */
  totalProcesses: number;
  /** Total value generated in EUR */
  totalValue: number;
  /** Total time saved in hours */
  totalTimeSaved: number;
  /** Average reliability across all processes */
  avgReliability: number;
}

/**
 * Calculate global statistics for the dashboard
 * 
 * Aggregates metrics from all teams, agents, and processes
 * to provide KPIs for the main dashboard view.
 * 
 * @returns GlobalStats object with aggregated metrics
 * 
 * @example
 * const stats = getGlobalStats();
 * // {
 * //   activeAgents: 4,
 * //   totalAgents: 16,
 * //   runningProcesses: 3,
 * //   totalProcesses: 8,
 * //   totalValue: 45833,
 * //   totalTimeSaved: 699,
 * //   avgReliability: 96
 * // }
 */
export function getGlobalStats(): GlobalStats {
  // Count active agents (status: active or busy)
  const activeAgents = seedAgents.filter(a => a.status === 'active' || a.status === 'busy').length;
  
  // Sum up individual agent counts across all teams
  const totalAgents = seedAgents.reduce((sum, a) => sum + (a.agentCount || 1), 0);
  
  // Count currently running processes based on current hour
  const currentHour = new Date().getHours();
  const runningProcesses = seedScheduleEntries.filter(
    entry => entry.startHour <= currentHour && entry.endHour > currentHour
  ).length;
  
  // Calculate total value generated (convert from cents to EUR)
  const totalValue = seedProcesses.reduce((sum, p) => sum + getProcessTotalValue(p), 0);
  
  // Calculate total time saved (convert from minutes to hours)
  const totalTimeSaved = seedProcesses.reduce((sum, p) => sum + (p.successCount * p.estimatedMinutes), 0);
  
  return {
    activeAgents,
    totalAgents,
    runningProcesses,
    totalProcesses: seedProcesses.length,
    totalValue: Math.round(totalValue / 100), // Convert cents to EUR
    totalTimeSaved: Math.round(totalTimeSaved / 60), // Convert minutes to hours
    avgReliability: Math.round(
      seedProcesses.reduce((sum, p) => sum + getProcessReliability(p), 0) / seedProcesses.length
    ),
  };
}
