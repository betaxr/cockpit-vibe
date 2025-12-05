/**
 * Narrative Seed Data for the Agent Management System
 * 
 * This file contains realistic mock data representing a pharmacy chain
 * with multiple teams, agents, processes, and workspaces.
 */

// Teams - Organizational units
export const seedTeams = [
  {
    name: "Team Verkauf",
    teamId: "TEAM-SALES-001",
    region: "Deutschland Süd",
    customerType: "B2C, Endkunden",
    project: "Kundenberatung & Verkauf",
  },
  {
    name: "Team Marketing",
    teamId: "TEAM-MKT-002",
    region: "DACH",
    customerType: "B2B, Partner",
    project: "Social Media & Kampagnen",
  },
  {
    name: "Team Logistik",
    teamId: "TEAM-LOG-003",
    region: "Deutschland",
    customerType: "Intern",
    project: "Wareneingang & Versand",
  },
  {
    name: "Team Support",
    teamId: "TEAM-SUP-004",
    region: "Europa",
    customerType: "B2C, Reklamationen",
    project: "Kundenservice & Retouren",
  },
];

// Agents - Digital workers assigned to teams
export const seedAgents = [
  {
    name: "Luna",
    agentId: "AGT-001",
    teamIndex: 0, // Team Verkauf
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: "#f97316",
    capabilities: ["Beratung", "Produktsuche", "Bestellungen"],
  },
  {
    name: "Max",
    agentId: "AGT-002",
    teamIndex: 1, // Team Marketing
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: "#eab308",
    capabilities: ["Social Media", "Content Creation", "Analytics"],
  },
  {
    name: "Sophie",
    agentId: "AGT-003",
    teamIndex: 2, // Team Logistik
    status: "busy" as const,
    hoursPerDay: 24,
    avatarColor: "#22c55e",
    capabilities: ["Inventur", "Versandvorbereitung", "Tracking"],
  },
  {
    name: "Felix",
    agentId: "AGT-004",
    teamIndex: 3, // Team Support
    status: "active" as const,
    hoursPerDay: 24,
    avatarColor: "#3b82f6",
    capabilities: ["Ticketbearbeitung", "Retouren", "FAQ"],
  },
  {
    name: "Emma",
    agentId: "AGT-005",
    teamIndex: 0, // Team Verkauf
    status: "idle" as const,
    hoursPerDay: 12,
    avatarColor: "#ec4899",
    capabilities: ["Nachtschicht", "Bestellungen", "Notfälle"],
  },
];

// Workspaces - Physical/Virtual machines where agents work
export const seedWorkspaces = [
  {
    name: "Apotheken-Terminal 1",
    workspaceId: "WS-APO-001",
    type: "physical" as const,
    status: "online" as const,
    location: "Filiale München",
    agentIndex: 0, // Luna
  },
  {
    name: "Marketing-VM",
    workspaceId: "WS-MKT-001",
    type: "virtual" as const,
    status: "online" as const,
    location: "Cloud Azure",
    agentIndex: 1, // Max
  },
  {
    name: "Lager-Terminal",
    workspaceId: "WS-LOG-001",
    type: "physical" as const,
    status: "online" as const,
    location: "Zentrallager",
    agentIndex: 2, // Sophie
  },
  {
    name: "Support-Workstation",
    workspaceId: "WS-SUP-001",
    type: "virtual" as const,
    status: "online" as const,
    location: "Cloud AWS",
    agentIndex: 3, // Felix
  },
  {
    name: "Nacht-Terminal",
    workspaceId: "WS-APO-002",
    type: "physical" as const,
    status: "offline" as const,
    location: "Filiale München",
    agentIndex: 4, // Emma
  },
];

// Processes - Automated tasks that agents execute
export const seedProcesses = [
  {
    name: "Social Media Posting",
    processId: "PROC-SM-001",
    description: "Automatisches Posten auf Instagram, Facebook und LinkedIn",
    category: "Marketing",
    estimatedMinutes: 15,
    valuePerRun: 2500, // in cents = 25€
    agentIndex: 1, // Max
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
    valuePerRun: 500, // 5€
    agentIndex: 0, // Luna
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
    valuePerRun: 15000, // 150€
    agentIndex: 2, // Sophie
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
    valuePerRun: 1000, // 10€
    agentIndex: 3, // Felix
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
    valuePerRun: 3000, // 30€
    agentIndex: 3, // Felix
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
    valuePerRun: 5000, // 50€
    agentIndex: 0, // Luna
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
    valuePerRun: 8000, // 80€
    agentIndex: 1, // Max
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
    valuePerRun: 200, // 2€
    agentIndex: 2, // Sophie
    scheduleCount: 2156,
    successCount: 2134,
    failCount: 22,
  },
];

// Schedule entries - What agents do throughout the day
export const seedScheduleEntries = [
  // Luna (Agent 0) - Verkauf
  { agentIndex: 0, title: "Bestellbestätigung", startHour: 0, endHour: 1, color: "#c2410c", processIndex: 1 },
  { agentIndex: 0, title: "Bestellbestätigung", startHour: 3, endHour: 4, color: "#c2410c", processIndex: 1 },
  { agentIndex: 0, title: "Preisvergleich", startHour: 6, endHour: 7, color: "#a16207", processIndex: 5 },
  { agentIndex: 0, title: "Bestellbestätigung", startHour: 9, endHour: 10, color: "#c2410c", processIndex: 1 },
  { agentIndex: 0, title: "Kundenberatung", startHour: 10, endHour: 12, color: "#78716c" },
  { agentIndex: 0, title: "Bestellbestätigung", startHour: 14, endHour: 15, color: "#c2410c", processIndex: 1 },
  { agentIndex: 0, title: "Preisvergleich", startHour: 18, endHour: 19, color: "#a16207", processIndex: 5 },
  { agentIndex: 0, title: "Bestellbestätigung", startHour: 21, endHour: 22, color: "#c2410c", processIndex: 1 },
  
  // Max (Agent 1) - Marketing
  { agentIndex: 1, title: "Social Media Posting", startHour: 7, endHour: 8, color: "#c2410c", processIndex: 0 },
  { agentIndex: 1, title: "Content Creation", startHour: 9, endHour: 11, color: "#78716c" },
  { agentIndex: 1, title: "Social Media Posting", startHour: 12, endHour: 13, color: "#c2410c", processIndex: 0 },
  { agentIndex: 1, title: "Analytics Review", startHour: 14, endHour: 15, color: "#a16207" },
  { agentIndex: 1, title: "Newsletter-Versand", startHour: 16, endHour: 17, color: "#eab308", processIndex: 6 },
  { agentIndex: 1, title: "Social Media Posting", startHour: 18, endHour: 19, color: "#c2410c", processIndex: 0 },
  
  // Sophie (Agent 2) - Logistik
  { agentIndex: 2, title: "Inventur-Check", startHour: 5, endHour: 6, color: "#22c55e", processIndex: 2 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 7, endHour: 9, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 10, endHour: 12, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Wareneingang", startHour: 13, endHour: 15, color: "#78716c" },
  { agentIndex: 2, title: "Versandvorbereitung", startHour: 16, endHour: 18, color: "#c2410c", processIndex: 7 },
  { agentIndex: 2, title: "Inventur-Check", startHour: 20, endHour: 21, color: "#22c55e", processIndex: 2 },
  
  // Felix (Agent 3) - Support
  { agentIndex: 3, title: "Ticket-Triage", startHour: 8, endHour: 9, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 9, endHour: 11, color: "#a16207", processIndex: 4 },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 12, endHour: 13, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Kundenservice", startHour: 14, endHour: 16, color: "#78716c" },
  { agentIndex: 3, title: "Ticket-Triage", startHour: 17, endHour: 18, color: "#3b82f6", processIndex: 3 },
  { agentIndex: 3, title: "Retouren-Verarbeitung", startHour: 19, endHour: 20, color: "#a16207", processIndex: 4 },
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
  const totalAgents = seedAgents.length;
  
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
