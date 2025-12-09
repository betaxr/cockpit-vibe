import "dotenv/config";
import { MongoClient } from "mongodb";

const DEMO_TENANT = process.env.SEED_TENANT_ID || "demo";
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB || "cockpit";

if (!MONGO_URI) {
  console.error("MONGO_URI required for seeding");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const agents = db.collection("agents");
  const teams = db.collection("teams");
  const workspaces = db.collection("workspaces");
  const processes = db.collection("processes");
  const schedules = db.collection("schedules");

  await agents.deleteMany({ tenantId: DEMO_TENANT });
  await teams.deleteMany({ tenantId: DEMO_TENANT });
  await workspaces.deleteMany({ tenantId: DEMO_TENANT });
  await processes.deleteMany({ tenantId: DEMO_TENANT });
  await schedules.deleteMany({ tenantId: DEMO_TENANT });

  const teamDocs = [
    { tenantId: DEMO_TENANT, externalId: "team-1", name: "Marketing", color: "#8b5cf6" },
    { tenantId: DEMO_TENANT, externalId: "team-2", name: "Logistik", color: "#22c55e" },
  ];
  await teams.insertMany(teamDocs);

  const agentDocs = [
    { tenantId: DEMO_TENANT, externalId: "agent-1", name: "Agent A", teamId: "team-1", status: "active", hoursPerDay: 24, avatarColor: "#f59e0b" },
    { tenantId: DEMO_TENANT, externalId: "agent-2", name: "Agent B", teamId: "team-2", status: "busy", hoursPerDay: 24, avatarColor: "#0ea5e9" },
  ];
  await agents.insertMany(agentDocs);

  const processDocs = [
    { tenantId: DEMO_TENANT, externalId: "proc-1", name: "Bestellung", processId: "P-100", lifecycle: "running", valuePerRun: 100, successCount: 10, failCount: 1, agentId: "agent-1" },
    { tenantId: DEMO_TENANT, externalId: "proc-2", name: "Inventur", processId: "P-200", lifecycle: "planned", valuePerRun: 50, successCount: 5, failCount: 0, agentId: "agent-2" },
  ];
  await processes.insertMany(processDocs);

  const workspaceDocs = [
    { tenantId: DEMO_TENANT, externalId: "ws-1", name: "Arbeitsplatz A", workspaceId: "WS-1", type: "VM", status: "available", agentId: "agent-1" },
    { tenantId: DEMO_TENANT, externalId: "ws-2", name: "Arbeitsplatz B", workspaceId: "WS-2", type: "PC", status: "busy", agentId: "agent-2" },
  ];
  await workspaces.insertMany(workspaceDocs);

  const scheduleDocs = [
    { tenantId: DEMO_TENANT, externalId: "sched-1", title: "Bestellung", startHour: 9, endHour: 11, color: "#22c55e", agentId: "agent-1", processId: "proc-1" },
    { tenantId: DEMO_TENANT, externalId: "sched-2", title: "Inventur", startHour: 12, endHour: 14, color: "#3b82f6", agentId: "agent-2", processId: "proc-2" },
  ];
  await schedules.insertMany(scheduleDocs);

  console.log("Seed complete for tenant", DEMO_TENANT);
  await client.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
