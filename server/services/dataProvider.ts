import { Collection, Document } from "mongodb";
import { getMongoDb } from "../_core/mongo";
import { THEME_COLORS } from "../../shared/themeColors";
import { syncAgents, syncProcesses, syncSchedules, syncTeams, syncWorkspaces } from "./collectorSync";

type AgentDoc = {
  tenantId: string;
  externalId: string;
  name: string;
  teamId?: string | number | null;
  agentId?: string | number;
  hoursPerDay?: number;
  status?: "active" | "idle" | "offline" | "busy" | "planned";
  avatarColor?: string | null;
  skills?: string | null;
};

type TeamDoc = {
  tenantId: string;
  externalId: string;
  name: string;
  color?: string;
};

type WorkspaceDoc = {
  tenantId: string;
  externalId: string;
  name: string;
  workspaceId: string;
  type: string;
  status: "available" | "busy" | "idle" | "offline" | "maintenance";
  location?: string;
  agentId?: string | number;
};

type ProcessDoc = {
  tenantId: string;
  externalId: string;
  name: string;
  processId: string;
  description?: string;
  category?: string;
  estimatedMinutes?: number;
  valuePerRun?: number;
  scheduleCount?: number;
  successCount?: number;
  failCount?: number;
  agentId?: string | number;
  lifecycle?: "planned" | "scheduled" | "running" | "completed" | "failed" | "canceled";
  isTest?: boolean;
};

type ScheduleDoc = {
  tenantId: string;
  externalId?: string;
  id?: number | string;
  title: string;
  startHour: number;
  endHour: number;
  color?: string;
  agentId?: string | number;
  processId?: string | number;
};

async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<T>(name);
}

async function ensureSynced<T extends Document>(name: string, syncFn: (col: Collection<T>) => Promise<void>) {
  const col = await getCollection<T>(name);
  if (!col) return;
  await syncFn(col);
}

export async function fetchTeams(tenantId: string) {
  const col = await getCollection<TeamDoc>("teams");
  if (!col) throw new Error("MongoDB not configured");
  await ensureSynced("teams", syncTeams);
  const docs = await col.find({ tenantId }).toArray();
  return docs.map((t) => ({
    id: t.externalId,
    externalId: t.externalId,
    name: t.name,
    color: t.color ?? THEME_COLORS.primary,
  }));
}

export async function fetchAgents(tenantId: string) {
  const col = await getCollection<AgentDoc>("agents");
  if (!col) throw new Error("MongoDB not configured");
  await ensureSynced("agents", syncAgents);
  const docs = await col.find({ tenantId }).toArray();
  const teams = await fetchTeams(tenantId);
  return docs.map((a) => {
    const team = teams.find(t => `${t.externalId}` === `${a.teamId}`);
    return {
      id: a.externalId,
      externalId: a.externalId,
      name: a.name,
      agentId: a.agentId ?? a.externalId,
      teamId: team?.externalId ?? null,
      hoursPerDay: a.hoursPerDay ?? 24,
      status: a.status ?? "active",
      avatarColor: a.avatarColor ?? THEME_COLORS.primary,
      skills: a.skills ?? null,
      team: team ?? null,
    };
  });
}

export async function fetchWorkspaces(tenantId: string) {
  const col = await getCollection<WorkspaceDoc>("workspaces");
  if (!col) throw new Error("MongoDB not configured");
  await ensureSynced("workspaces", syncWorkspaces);
  const docs = await col.find({ tenantId }).toArray();
  const agents = await fetchAgents(tenantId);
  return docs.map((ws) => {
    const agent = ws.agentId ? agents.find(a => `${a.externalId}` === `${ws.agentId}`) : null;
    return {
      id: ws.externalId,
      externalId: ws.externalId,
      name: ws.name,
      workspaceId: ws.workspaceId,
      type: ws.type,
      status: ws.status,
      location: ws.location,
      agent: agent ? { id: agent.externalId, name: agent.name, status: agent.status } : null,
    };
  });
}

export async function fetchProcesses(tenantId: string) {
  const col = await getCollection<ProcessDoc>("processes");
  if (!col) throw new Error("MongoDB not configured");
  await ensureSynced("processes", syncProcesses);
  const docs = await col.find({ tenantId }).toArray();
  const agents = await fetchAgents(tenantId);
  return docs.map((p) => {
    const agent = p.agentId ? agents.find(a => `${a.externalId}` === `${p.agentId}`) : null;
    const est = p.estimatedMinutes ?? 30;
    const successCount = p.successCount ?? 0;
    const valPerRun = p.valuePerRun ?? 0;
    const failCount = p.failCount ?? 0;
    return {
      id: p.externalId,
      externalId: p.externalId,
      name: p.name,
      processId: p.processId,
      description: p.description ?? "",
      category: p.category ?? "general",
      estimatedMinutes: est,
      valuePerRun: valPerRun,
      scheduleCount: p.scheduleCount ?? 0,
      successCount,
      failCount,
      reliability: successCount + failCount > 0 ? Math.round((successCount / (successCount + failCount)) * 100) : 100,
      totalValue: successCount * valPerRun,
      totalTimeSaved: successCount * est,
      lifecycle: p.lifecycle ?? "planned",
      isTest: p.isTest ?? false,
      agent: agent ? { id: agent.externalId, name: agent.name, avatarColor: agent.avatarColor } : null,
    };
  });
}

export async function fetchScheduleEntries(tenantId: string) {
  const col = await getCollection<ScheduleDoc>("schedules");
  if (!col) throw new Error("MongoDB not configured");
  await ensureSynced("schedules", syncSchedules);
  const docs = await col.find({ tenantId }).toArray();
  return docs.map((s, idx) => ({
    id: s.externalId ?? s.id ?? idx + 1,
    title: s.title,
    startHour: s.startHour,
    endHour: s.endHour,
    color: s.color ?? THEME_COLORS.primary,
    agentId: s.agentId,
    processId: s.processId,
  }));
}

export async function fetchRunningProcesses(tenantId: string, from?: Date, to?: Date) {
  const processes = await fetchProcesses(tenantId);
  const schedule = await fetchScheduleEntries(tenantId);
  const now = new Date();
  const windowStart = from ?? new Date(now.setHours(0, 0, 0, 0));
  const windowEnd = to ?? new Date(now.setHours(23, 59, 59, 999));

  return schedule
    .filter(entry => {
      const entryStart = new Date(now);
      entryStart.setHours(entry.startHour, 0, 0, 0);
      const entryEnd = new Date(now);
      entryEnd.setHours(entry.endHour, 0, 0, 0);
      return entryStart <= windowEnd && entryEnd >= windowStart;
    })
    .map(entry => {
      const agent = processes.find(p => p.agent?.id === entry.agentId)?.agent;
      const process = processes.find(p => p.id === entry.processId);
      return {
        title: entry.title,
        agentId: agent?.id ?? entry.agentId ?? 0,
        agentName: agent?.name ?? "Unknown",
        agentColor: agent?.avatarColor ?? THEME_COLORS.muted,
        processId: process?.id ?? entry.processId ?? null,
        processName: process?.name ?? entry.title,
        startHour: entry.startHour,
        endHour: entry.endHour,
        color: entry.color ?? THEME_COLORS.primary,
      };
    });
}

export async function fetchGlobalStats(tenantId: string, from?: Date, to?: Date) {
  const agents = await fetchAgents(tenantId);
  const processes = await fetchProcesses(tenantId);
  const totalAgents = agents.filter(a => ["active", "busy", "idle", "planned"].includes(a.status ?? "active")).length;
  const busyAgents = agents.filter(a => a.status === "busy").length;
  const runningProcesses = (await fetchRunningProcesses(tenantId, from, to)).length;
  return {
    activeAgents: totalAgents,
    runningProcesses,
    completedProcesses: processes.filter(p => p.lifecycle === "completed").length,
    utilizationAgents: totalAgents > 0 ? busyAgents / totalAgents : 0,
    successRate: 0,
    avgResponseTime: 0,
  };
}
