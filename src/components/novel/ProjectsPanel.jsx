import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock, FolderOpen, Save, Loader2 } from "lucide-react";

export default function ProjectsPanel({ currentProject, onLoad, onNew, onSave }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await base44.entities.FormattingProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      await fetchProjects();
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
  };

  return (
    <div className="w-56 flex-shrink-0 hidden lg:flex flex-col">
      <div className="sticky top-20 flex flex-col gap-2 max-h-[calc(100vh-6rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Proyectos
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Nuevo proyecto"
            onClick={() => { onNew(); fetchProjects(); }}
            aria-label="Crear nuevo proyecto"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Save current */}
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 w-full gap-1.5"
          onClick={handleSave}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {saving ? "Guardando…" : "Guardar"}
        </Button>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 mt-1">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-label="Cargando proyectos" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 leading-relaxed px-2">
              Guarda tu primer proyecto para verlo aquí.
            </p>
          ) : (
            projects.map(p => {
              const isActive = currentProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onLoad(p)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors group flex items-start justify-between gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted/60"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate leading-snug ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                      {p.title || "Sin título"}
                    </p>
                    {p.author && (
                      <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {p.author}
                      </p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${isActive ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                      {formatDate(p.updated_date)}
                      {p.word_count > 0 && <span>· {(p.word_count / 1000).toFixed(1)}k pal.</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, p.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded mt-0.5 ${
                      isActive ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 hover:text-destructive"
                    }`}
                    aria-label={`Eliminar proyecto "${p.title || "Sin título"}"`}
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                  </button>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}