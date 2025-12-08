import { Collection, WithId } from "mongodb";
import { seedAgents, seedTeams, seedWorkspaces, seedProcesses, seedScheduleEntries, getProcessReliability, getProcessTotalValue, getAgentCurrentProcess, getGlobalStats as getSeedGlobalStats } from "../seedData";
import { getMongoDb } from "../_core/mongo";
import { ENV } from "../_core/env";
import { THEME_COLORS } from "../../shared/themeColors";
import { syncAgents, syncProcesses, syncSchedules, syncTeams, syncWorkspaces } from "./collectorSync";

const defaultTenant = process.env.TENANT_ID ?? "default";

type AgentDoc = {
  tenantId?: string;
  id?: number;
  agentId?: string;
  name: string;
  teamId?: number | string | null;
  hoursPerDay?: number;
  status?: "active" | "idle" | "offline" | "busy";
  avatarColor?: string | null;
  skills?: string | null;
};

type TeamDoc = {
  tenantId?: string;
  id?: number;
  name: string;
  color?: string;
};

type WorkspaceDoc = {
  tenantId?: string;
  id?: number;
  name: string;
  workspaceId: string;
  type: string;
  status: string;
  location?: string;
  agentId?: number;
  agentIndex?: number;
};

type ProcessDoc = {
  tenantId?: string;
  id?: number;
  name: string;
  processId: string;
  description?: string;
  category?: string;
  estimatedMinutes?: number;
  valuePerRun?: number;
  scheduleCount?: number;
  successCount?: number;
  failCount?: number;
  agentId?: number;
  agentIndex?: number;
};

type ScheduleDoc = {
  tenantId?: string;
  id?: number | string;
  title: string;
  startHour: number;
  endHour: number;
  color?: string;
  agentId?: number;
  agentIndex?: number;
  processId?: number;
  processIndex?: number;
};

async function getCollection<T>(name: string): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<T>(name);
}

async function ensureSynced<T>(name: string, syncFn: (col: Collection<T>) => Promise<void>) {
  const col = await getCollection<T>(name);
  if (!col) return;
  const hasDocs = await col.find({ tenantId: defaultTenant }).limit(1).toArray();
  if (!hasDocs.length) {
    await syncFn(col);
  }
}

export async function fetchTeams() {
  const col = await getCollection<TeamDoc>("teams");
  if (!col) {
    return seedTeams.map((team, index) => ({ id: index + 1, ...team }));
  }
  await ensureSynced("teams", syncTeams);
  const docs = await col.find({ tenantId: defaultTenant }).toArray();
  if (!docs.length) {
    return seedTeams.map((team, index) => ({ id: index + 1, ...team }));
  }
  return docs.map((t, idx) => ({
    id: t.id ?? idx + 1,
    name: t.name,
    color: t.color ?? THEME_COLORS.primary,
  }));
}

export async function fetchAgents() {
  const col = await getCollection<AgentDoc>("agents");
  const teams = await fetchTeams();
  if (!col) {
    return seedAgents.map((agent, index) => ({
      id: index + 1,
      ...agent,
      team: teams.find(t => t.id === agent.teamIndex + 1) ?? null,
    }));
  }
  await ensureSynced("agents", syncAgents);
  const docs = await col.find({ tenantId: defaultTenant }).toArray();
  if (!docs.length) {
    return seedAgents.map((agent, index) => ({
      id: index + 1,
      ...agent,
      team: teams.find(t => t.id === agent.teamIndex + 1) ?? null,
    }));
  }
  return docs.map((a, idx) => {
    const team = teams.find(t => `${t.id}` === `${a.teamId}`);
    return {
      id: a.id ?? idx + 1,
      name: a.name,
      agentId: a.agentId ?? `agent-${a.id ?? idx + 1}`,
      teamId: team?.id ?? null,
      hoursPerDay: a.hoursPerDay ?? 24,
      status: a.status ?? "active",
      avatarColor: a.avatarColor ?? THEME_COLORS.primary,
      skills: a.skills ?? null,
      team: team ?? null,
    };
  });
}

export async function fetchWorkspaces() {
  const col = await getCollection<WorkspaceDoc>("workspaces");
  const agents = await fetchAgents();
  if (!col) {
    return seedWorkspaces.map((ws, index) => ({
      id: index + 1,
      name: ws.name,
      workspaceId: ws.workspaceId,
      type: ws.type,
      status: ws.status,
      location: ws.location,
      agent: agents[ws.agentIndex] ? {
        id: ws.agentIndex + 1,
        name: agents[ws.agentIndex].name,
        status: agents[ws.agentIndex].status,
      } : null,
    }));
  }
  await ensureSynced("workspaces", syncWorkspaces);
  const docs = await col.find({ tenantId: defaultTenant }).toArray();
  if (!docs.length) {
    return seedWorkspaces.map((ws, index) => ({
      id: index + 1,
      name: ws.name,
      workspaceId: ws.workspaceId,
      type: ws.type,
      status: ws.status,
      location: ws.location,
      agent: agents[ws.agentIndex] ? {
        id: ws.agentIndex + 1,
        name: agents[ws.agentIndex].name,
        status: agents[ws.agentIndex].status,
      } : null,
    }));
  }
  return docs.map((ws, idx) => {
    const agent = agents.find(a => `${a.id}` === `${ws.agentId ?? ws.agentIndex ?? ""}`);
    return {
      id: ws.id ?? idx + 1,
      name: ws.name,
      workspaceId: ws.workspaceId,
      type: ws.type,
      status: ws.status,
      location: ws.location,
      agent: agent ? { id: agent.id, name: agent.name, status: agent.status } : null,
    };
  });
}

export async function fetchProcesses() {
  const col = await getCollection<ProcessDoc>("processes");
  const agents = await fetchAgents();
  if (!col) {
    return seedProcesses.map((p, index) => {
      const agent = agents[p.agentIndex];
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
        status: "idle" as const,
        agent: agent ? { id: agent.id, name: agent.name, avatarColor: agent.avatarColor } : null,
      };
    });
  }
  await ensureSynced("processes", syncProcesses);
  const docs = await col.find({ tenantId: defaultTenant }).toArray();
  if (!docs.length) {
    return seedProcesses.map((p, index) => {
      const agent = agents[p.agentIndex];
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
        status: "idle" as const,
        agent: agent ? { id: agent.id, name: agent.name, avatarColor: agent.avatarColor } : null,
      };
    });
  }
  return docs.map((p, idx) => {
    const agent = agents.find(a => `${a.id}` === `${p.agentId ?? p.agentIndex ?? ""}`);
    const est = p.estimatedMinutes ?? 30;
    const successCount = p.successCount ?? 0;
    const valPerRun = p.valuePerRun ?? 0;
    return {
      id: p.id ?? idx + 1,
      name: p.name,
      processId: p.processId,
      description: p.description ?? "",
      category: p.category ?? "general",
      estimatedMinutes: est,
      valuePerRun: valPerRun,
      scheduleCount: p.scheduleCount ?? 0,
      successCount,
      failCount: p.failCount ?? 0,
      reliability: successCount + (p.failCount ?? 0) > 0 ? Math.round((successCount / (successCount + (p.failCount ?? 0))) * 100) : 100,
      totalValue: successCount * valPerRun,
      totalTimeSaved: successCount * est,
      status: "idle" as const,
      agent: agent ? { id: agent.id, name: agent.name, avatarColor: agent.avatarColor } : null,
    };
  });
}

export async function fetchScheduleEntries() {
  const col = await getCollection<ScheduleDoc>("schedules");
  if (!col) {
    return seedScheduleEntries.map((entry, index) => ({ id: index + 1, ...entry }));
  }
  await ensureSynced("schedules", syncSchedules);
  const docs = await col.find({ tenantId: defaultTenant }).toArray();
  if (!docs.length) {
    return seedScheduleEntries.map((entry, index) => ({ id: index + 1, ...entry }));
  }
  return docs.map((s, idx) => ({
    id: s.id ?? idx + 1,
    title: s.title,
    startHour: s.startHour,
    endHour: s.endHour,
    color: s.color ?? THEME_COLORS.primary,
    agentId: s.agentId ?? (s.agentIndex !== undefined ? s.agentIndex + 1 : undefined),
    processId: s.processId ?? (s.processIndex !== undefined ? s.processIndex + 1 : undefined),
  }));
}

export async function fetchRunningProcesses() {
  const processes = await fetchProcesses();
  const schedule = await fetchScheduleEntries();
  const currentHour = new Date().getHours();
  return schedule
    .filter(entry => entry.startHour <= currentHour && entry.endHour > currentHour)
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

export async function fetchGlobalStats() {
  const agents = await fetchAgents();
  const processes = await fetchProcesses();
  if (!agents.length || !processes.length) {
    return getSeedGlobalStats();
  }
  const activeAgents = agents.filter(a => a.status === "active" || a.status === "busy").length;
  const runningProcesses = (await fetchRunningProcesses()).length;
  const completedProcesses = processes.filter(p => p.status === "completed").length;
  return {
    activeAgents,
    runningProcesses,
    completedProcesses,
    successRate: 98,
    avgResponseTime: 1.2,
  };
}
