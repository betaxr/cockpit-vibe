import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import PageContainer from "@/components/PageContainer";
import { trpc } from "@/lib/trpc";
import { Monitor, Wifi, WifiOff, MapPin, User, Server, Cloud } from "lucide-react";

export default function Arbeitsplaetze() {
  const { isEditMode } = useEditMode();
  
  const { data: workspaces = [] } = trpc.workspaces.list.useQuery();
  
  const onlineCount = workspaces.filter(w => w.status === 'online').length;
  const offlineCount = workspaces.filter(w => w.status === 'offline').length;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return <Monitor className="w-6 h-6 text-[color:var(--color-primary)]" />;
      case 'virtual': return <Cloud className="w-6 h-6 text-blue-400" />;
      case 'server': return <Server className="w-6 h-6 text-purple-400" />;
      default: return <Monitor className="w-6 h-6 text-[color:var(--color-primary)]" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'physical': return 'Physisch';
      case 'virtual': return 'Virtuell';
      case 'server': return 'Server';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        {/* Header with KPIs */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Arbeitsplätze</h1>
            <p className="text-white/50 mt-1.5">Installationen und Verbindungen</p>
          </div>
          
          <div className="flex gap-4">
            <KPICard 
              value={workspaces.length} 
              label="Gesamt" 
              icon={<Monitor className="w-5 h-5" />} 
            />
            <KPICard 
              value={onlineCount} 
              label="Online" 
              icon={<Wifi className="w-5 h-5" />} 
            />
            <KPICard 
              value={offlineCount} 
              label="Offline" 
              icon={<WifiOff className="w-5 h-5" />} 
            />
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
          <ModuleCard 
            key={workspace.id}
            isEditable={isEditMode}
          >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "color-mix(in oklch, var(--color-card) 60%, transparent)" }}
                    >
                      {getTypeIcon(workspace.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{workspace.name}</h3>
                      <p className="text-sm text-white/50">{getTypeLabel(workspace.type)}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(workspace.status)}`} />
                </div>
                
                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-2">
                      {workspace.status === 'online' ? (
                        <Wifi className="w-4 h-4" />
                      ) : (
                        <WifiOff className="w-4 h-4" />
                      )}
                      Status
                    </span>
                    <span className={`font-medium ${
                      workspace.status === 'online' ? 'text-green-400' : 'text-white/60'
                    }`}>
                      {workspace.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Standort
                    </span>
                    <span className="text-white/80">{workspace.location}</span>
                  </div>
                  
                  {workspace.agent && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Agent
                      </span>
                      <span className="text-white/80 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          workspace.agent.status === 'active' ? 'bg-green-500' : 
                          workspace.agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        {workspace.agent.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">ID</span>
                    <span className="text-white/60 font-mono text-xs">{workspace.workspaceId}</span>
                  </div>
                </div>
              </div>
            </ModuleCard>
          ))}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
