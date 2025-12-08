import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { Brain, Search, Plus, Tag } from "lucide-react";
import { useState } from "react";

export default function Cortex() {
  const { isEditMode } = useEditMode();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: entries = [] } = trpc.cortex.list.useQuery();
  
  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* MaxWidth Container with Apple HIG spacing */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Cortex</h1>
            <p className="text-white/50 mt-1">Wissensdatenbank und Dokumentation</p>
          </div>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            <Plus className="w-4 h-4" />
            Neuer Eintrag
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Suche in Cortex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
            style={{
              background: "color-mix(in oklch, var(--color-card) 85%, transparent)",
              border: "1px solid color-mix(in oklch, var(--color-border) 80%, transparent)",
            }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filteredEntries.length === 0 ? (
            <ModuleCard 
              className="col-span-3" 
              icon={<Brain className="w-4 h-4" />}
              isEditable={isEditMode}
            >
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-20 text-white" />
                <h3 className="text-lg font-medium text-white/80 mb-2">Cortex ist leer</h3>
                <p className="text-white/50 mb-4">Fügen Sie Wissen hinzu, um Ihre Agenten zu verbessern</p>
                <button
                  className="px-4 py-2 rounded-lg text-white/70 transition-colors"
                  style={{ background: "color-mix(in oklch, var(--color-primary) 30%, transparent)" }}
                >
                  Ersten Eintrag erstellen
                </button>
              </div>
            </ModuleCard>
          ) : (
            filteredEntries.map((entry) => (
              <ModuleCard 
                key={entry.id}
                title={entry.title}
                icon={<Brain className="w-4 h-4" />}
                isEditable={isEditMode}
              >
                <p className="text-white/60 text-sm line-clamp-3">
                  {entry.content || "Kein Inhalt"}
                </p>
                {entry.category && (
                  <div className="mt-3 flex items-center gap-2">
                    <Tag className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">{entry.category}</span>
                  </div>
                )}
              </ModuleCard>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
