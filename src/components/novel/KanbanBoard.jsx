import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { key: "draft",      color: "bg-slate-100 dark:bg-slate-800",   dot: "bg-slate-400",   labelKey: "kanbanDraft" },
  { key: "editing",    color: "bg-amber-50 dark:bg-amber-950/30",  dot: "bg-amber-400",   labelKey: "kanbanEditing" },
  { key: "formatting", color: "bg-blue-50 dark:bg-blue-950/30",    dot: "bg-blue-400",    labelKey: "kanbanFormatting" },
  { key: "ready",      color: "bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-400", labelKey: "kanbanReady" },
];

function KanbanCard({ project, onMove, onLoad, columns, t }) {
  const [moving, setMoving] = useState(false);

  const handleMove = async (newStatus) => {
    if (newStatus === project.status) return;
    setMoving(true);
    try {
      await base44.entities.FormattingProject.update(project.id, { status: newStatus });
      onMove(project.id, newStatus);
    } catch (e) {
      console.error("Error al mover proyecto:", e);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => onLoad(project)}
    >
      <p className="text-xs font-semibold text-foreground truncate leading-snug">
        {project.title || t.withoutTitle}
      </p>
      {project.author && (
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{project.author}</p>
      )}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        {project.word_count > 0 && (
          <span className="flex items-center gap-0.5">
            <FileText className="w-2.5 h-2.5" />
            {(project.word_count / 1000).toFixed(1)}k
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          {new Date(project.updated_date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
        </span>
      </div>

      {/* Move buttons — visible on hover */}
      <div
        className="mt-2.5 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {columns.filter(c => c.key !== project.status).map(col => (
          <button
            key={col.key}
            disabled={moving}
            onClick={() => handleMove(col.key)}
            className={`text-[9px] px-1.5 py-0.5 rounded-full border border-border flex items-center gap-1 hover:bg-muted transition-colors ${moving ? "opacity-50 pointer-events-none" : ""}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
            {t[col.labelKey]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ onLoad, onClose }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FormattingProject.list("-updated_date", 200);
      setProjects(data);
    } catch (e) {
      toast({ title: t.toastErrorSave, description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleMove = (projectId, newStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
  };

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = projects.filter(p => (p.status || "draft") === col.key);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <h2 className="text-sm font-semibold">{t.kanbanTitle}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.kanbanClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const cards = grouped[col.key] || [];
              return (
                <div key={col.key} className={`w-64 flex-shrink-0 rounded-xl ${col.color} p-3 flex flex-col gap-2`}>
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      {t[col.labelKey]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium tabular-nums bg-background/60 px-1.5 py-0.5 rounded-full">
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                    {cards.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/60 text-center py-4 italic">{t.kanbanEmpty}</p>
                    ) : cards.map(p => (
                      <KanbanCard
                        key={p.id}
                        project={p}
                        onMove={handleMove}
                        onLoad={(proj) => { onLoad(proj); onClose(); }}
                        columns={COLUMNS}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}