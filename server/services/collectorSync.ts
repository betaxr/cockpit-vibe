import { Collection, Document } from "mongodb";
import { fetchCollector, isCollectorEnabled } from "../_core/collector";
import { THEME_COLORS } from "../../shared/themeColors";

const defaultTenant = process.env.TENANT_ID ?? "default";

async function upsertMany<T extends Document>(col: Collection<T>, docs: T[], idField: keyof T = "id" as keyof T) {
  if (!docs.length) return;
  const ops = docs.map(doc => ({
    updateOne: {
      filter: { tenantId: defaultTenant, [idField]: doc[idField] },
      update: { $set: { ...doc, tenantId: defaultTenant } },
      upsert: true,
    },
  }));
  await col.bulkWrite(ops, { ordered: false });
}

export async function syncTeams(col: Collection) {
  if (!isCollectorEnabled()) return;
  const data = await fetchCollector<any[]>({ path: "teams" });
  if (!data) return;
  const teams = data.map((t, idx) => ({
    id: t.id ?? idx + 1,
    name: t.name ?? `Team ${idx + 1}`,
    color: t.color ?? THEME_COLORS.primary,
    tenantId: defaultTenant,
  }));
  await upsertMany(col, teams);
}

export async function syncAgents(col: Collection) {
  if (!isCollectorEnabled()) return;
  const data = await fetchCollector<any[]>({ path: "agents" });
  if (!data) return;
  const agents = data.map((a, idx) => ({
    id: a.id ?? idx + 1,
    agentId: a.agentId ?? a.externalId ?? `agent-${idx + 1}`,
    name: a.name ?? `Agent ${idx + 1}`,
    teamId: a.teamId ?? a.team?.id ?? null,
    hoursPerDay: a.hoursPerDay ?? 24,
    status: a.status ?? "active",
    avatarColor: a.avatarColor ?? THEME_COLORS.primary,
    skills: a.skills ?? null,
    tenantId: defaultTenant,
  }));
  await upsertMany(col, agents);
}

export async function syncWorkspaces(col: Collection) {
  if (!isCollectorEnabled()) return;
  const data = await fetchCollector<any[]>({ path: "workspaces" });
  if (!data) return;
  const workspaces = data.map((w, idx) => ({
    id: w.id ?? idx + 1,
    name: w.name ?? `Workspace ${idx + 1}`,
    workspaceId: w.workspaceId ?? w.externalId ?? `ws-${idx + 1}`,
    type: w.type ?? "general",
    status: w.status ?? "online",
    location: w.location ?? "",
    agentId: w.agentId ?? w.agent?.id ?? null,
    tenantId: defaultTenant,
  }));
  await upsertMany(col, workspaces);
}

export async function syncProcesses(col: Collection) {
  if (!isCollectorEnabled()) return;
  const data = await fetchCollector<any[]>({ path: "processes" });
  if (!data) return;
  const processes = data.map((p, idx) => ({
    id: p.id ?? idx + 1,
    processId: p.processId ?? p.externalId ?? `proc-${idx + 1}`,
    name: p.name ?? `Prozess ${idx + 1}`,
    description: p.description ?? "",
    category: p.category ?? "general",
    estimatedMinutes: p.estimatedMinutes ?? 30,
    valuePerRun: p.valuePerRun ?? 0,
    scheduleCount: p.scheduleCount ?? 0,
    successCount: p.successCount ?? 0,
    failCount: p.failCount ?? 0,
    agentId: p.agentId ?? p.agent?.id ?? null,
    tenantId: defaultTenant,
  }));
  await upsertMany(col, processes);
}

export async function syncSchedules(col: Collection) {
  if (!isCollectorEnabled()) return;
  const data = await fetchCollector<any[]>({ path: "schedules" });
  if (!data) return;
  const schedules = data.map((s, idx) => ({
    id: s.id ?? idx + 1,
    title: s.title ?? `Slot ${idx + 1}`,
    startHour: s.startHour ?? 0,
    endHour: s.endHour ?? 1,
    color: s.color ?? THEME_COLORS.primary,
    agentId: s.agentId ?? s.agent?.id ?? null,
    processId: s.processId ?? s.process?.id ?? null,
    tenantId: defaultTenant,
  }));
  await upsertMany(col, schedules);
}
