import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, Clock, ChevronRight, FolderOpen } from "lucide-react";
import { DEFAULT_SETTINGS } from "@/lib/formatting-utils";

export default function ProjectsPanel({ currentProject, onLoad, onNew, onSave }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.FormattingProject.list("-updated_date", 50);
      setProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await base44.entities.FormattingProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="w-64 flex-shrink-0 hidden lg:flex flex-col">
      <div className="sticky top-20 flex flex-col gap-3 max-h-[calc(100vh-6rem)] overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            Mis Proyectos
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Nuevo proyecto"
            onClick={() => { onNew(); fetchProjects(); }}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 w-full"
          onClick={async () => { await onSave(); fetchProjects(); }}
        >
          Guardar proyecto actual
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Cargando...</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 leading-relaxed">
              Aún no tienes proyectos guardados.
            </p>
          ) : (
            projects.map(p => (
              <button
                key={p.id}
                onClick={() => onLoad(p)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors group flex items-start justify-between gap-2 ${
                  currentProject?.id === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border/50 hover:bg-muted/60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${currentProject?.id === p.id ? "text-primary-foreground" : "text-foreground"}`}>
                    {p.title || "Sin título"}
                  </p>
                  {p.author && (
                    <p className={`text-[10px] truncate mt-0.5 ${currentProject?.id === p.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {p.author}
                    </p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 text-[10px] ${currentProject?.id === p.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(p.updated_date)}
                    {p.word_count > 0 && (
                      <span className="ml-1">· {p.word_count.toLocaleString()} pal.</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, p.id)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${
                    currentProject?.id === p.id ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 hover:text-destructive"
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}