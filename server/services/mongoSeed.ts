import { getMongoDb, isMongoConfigured } from "../_core/mongo";
import { logger } from "../_core/ops";
import { seedAgents, seedProcesses, seedScheduleEntries, seedTeams, seedWorkspaces } from "../seedData";

const defaultTenant = process.env.TENANT_ID ?? "default";

function normalizeWorkspaceStatus(status: string | undefined) {
  if (status === "online") return "available";
  if (status === "offline") return "offline";
  return status ?? "available";
}

async function seedCollectionIfEmpty<T>(name: string, docs: T[]) {
  const db = await getMongoDb();
  if (!db) {
    logger.warn("[MongoSeed] MongoDB not available, skip seeding");
    return;
  }

  const col = db.collection<T>(name);
  const count = await col.estimatedDocumentCount();
  if (count > 0) {
    logger.info(`[MongoSeed] Skip ${name}, already has ${count} docs`);
    return;
  }

  if (!docs.length) {
    logger.warn(`[MongoSeed] No documents provided for ${name}`);
    return;
  }

  await col.insertMany(docs);
  logger.info(`[MongoSeed] Inserted ${docs.length} docs into ${name}`);
}

export async function seedMongoWithDefaults() {
  if (!isMongoConfigured()) {
    logger.warn("[MongoSeed] MONGO_URI not set, skip seeding");
    return;
  }

  const teams = seedTeams.map((team, idx) => ({
    tenantId: defaultTenant,
    externalId: team.teamId ?? `TEAM-${idx + 1}`,
    name: team.name,
    color: team.color,
  }));

  await seedCollectionIfEmpty("teams", teams);

  const agents = seedAgents.map((agent, idx) => {
    const team = seedTeams[agent.teamIndex];
    const teamId = team?.teamId ?? `TEAM-${agent.teamIndex + 1}`;
    return {
      tenantId: defaultTenant,
      externalId: agent.agentId ?? `AGENT-${idx + 1}`,
      name: agent.name,
      teamId,
      hoursPerDay: agent.hoursPerDay ?? 24,
      status: agent.status ?? "active",
      avatarColor: agent.avatarColor,
      skills: agent.capabilities?.join(", ") ?? null,
    };
  });

  await seedCollectionIfEmpty("agents", agents);

  const workspaces = seedWorkspaces.map((ws, idx) => {
    const agent = seedAgents[ws.agentIndex];
    return {
      tenantId: defaultTenant,
      externalId: ws.workspaceId ?? `WS-${idx + 1}`,
      name: ws.name,
      workspaceId: ws.workspaceId ?? `WS-${idx + 1}`,
      type: ws.type,
      status: normalizeWorkspaceStatus(ws.status),
      location: ws.location,
      agentId: agent?.agentId ?? null,
    };
  });

  await seedCollectionIfEmpty("workspaces", workspaces);

  const processes = seedProcesses.map((p, idx) => {
    const agent = seedAgents[p.agentIndex];
    return {
      tenantId: defaultTenant,
      externalId: p.processId ?? `PROC-${idx + 1}`,
      processId: p.processId ?? `PROC-${idx + 1}`,
      name: p.name,
      description: p.description,
      category: p.category,
      estimatedMinutes: p.estimatedMinutes,
      valuePerRun: p.valuePerRun,
      scheduleCount: p.scheduleCount,
      successCount: p.successCount,
      failCount: p.failCount,
      agentId: agent?.agentId ?? null,
      lifecycle: "completed",
      isTest: true,
    };
  });

  await seedCollectionIfEmpty("processes", processes);

  const schedule = seedScheduleEntries.map((entry, idx) => {
    const agent = seedAgents[entry.agentIndex];
    const process = entry.processIndex !== undefined ? seedProcesses[entry.processIndex] : undefined;
    return {
      tenantId: defaultTenant,
      externalId: `SCHED-${idx + 1}`,
      id: idx + 1,
      title: entry.title,
      startHour: entry.startHour,
      endHour: entry.endHour,
      color: entry.color,
      agentId: agent?.agentId ?? null,
      processId: process?.processId ?? null,
    };
  });

  await seedCollectionIfEmpty("schedules", schedule);
}
