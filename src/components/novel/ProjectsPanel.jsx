import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Clock, FolderOpen, Save, Loader2,
  Folder, FolderPlus, ChevronDown, ChevronRight, X, Check
} from "lucide-react";

const COLORS = [
  { value: "gray",   bg: "bg-gray-400" },
  { value: "red",    bg: "bg-red-400" },
  { value: "orange", bg: "bg-orange-400" },
  { value: "yellow", bg: "bg-yellow-400" },
  { value: "green",  bg: "bg-green-400" },
  { value: "blue",   bg: "bg-blue-400" },
  { value: "purple", bg: "bg-purple-400" },
  { value: "pink",   bg: "bg-pink-400" },
];

function ColorDot({ color, className = "" }) {
  const c = COLORS.find(c => c.value === color) || COLORS[0];
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${c.bg} ${className}`} />;
}

function NewCollectionForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("gray");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.Collection.create({ name: name.trim(), color });
      onSave(created);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
      <Input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
        placeholder="Nombre de la colección"
        className="h-7 text-xs"
      />
      <div className="flex items-center gap-1.5 flex-wrap">
        {COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-4 h-4 rounded-full ${c.bg} ring-offset-1 transition-all ${color === c.value ? "ring-2 ring-foreground" : ""}`}
            aria-label={c.value}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        <Button size="sm" className="h-6 text-xs flex-1" onClick={handleSave} disabled={!name.trim() || saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Crear
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ProjectItem({ project, isActive, onLoad, onDelete, onMoveToCollection, collections }) {
  const [showMove, setShowMove] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={() => onLoad(project)}
        className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors flex items-start justify-between gap-2 ${
          isActive
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border hover:bg-muted/60"
        }`}
        aria-current={isActive ? "true" : undefined}
      >
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate leading-snug ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
            {project.title || "Sin título"}
          </p>
          {project.author && (
            <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {project.author}
            </p>
          )}
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isActive ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            <Clock className="w-2.5 h-2.5" aria-hidden="true" />
            {new Date(project.updated_date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
            {project.word_count > 0 && <span>· {(project.word_count / 1000).toFixed(1)}k</span>}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded mt-0.5 ${
            isActive ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 hover:text-destructive"
          }`}
          aria-label={`Eliminar "${project.title || "Sin título"}"`}
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" />
        </button>
      </button>

      {/* Move to collection */}
      {collections.length > 0 && (
        <div className="absolute right-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMove(v => !v); }}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground"
              title="Mover a colección"
            >
              <Folder className="w-3 h-3" />
            </button>
            {showMove && (
              <div className="absolute right-0 top-5 z-10 bg-popover border border-border rounded-lg shadow-md py-1 min-w-[130px]">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
                  onClick={() => { onMoveToCollection(project.id, null); setShowMove(false); }}
                >
                  <span className="text-muted-foreground">Sin colección</span>
                </button>
                {collections.map(col => (
                  <button
                    key={col.id}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
                    onClick={() => { onMoveToCollection(project.id, col.id); setShowMove(false); }}
                  >
                    <ColorDot color={col.color} />
                    <span className="truncate">{col.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionGroup({ collection, projects, currentProject, onLoad, onDelete, onDeleteCollection, onMoveToCollection, collections }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted/50 transition-colors group"
      >
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <ColorDot color={collection.color} />
        <span className="text-[11px] font-semibold text-muted-foreground truncate flex-1 text-left">{collection.name}</span>
        <span className="text-[10px] text-muted-foreground/60">{projects.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteCollection(collection.id); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-opacity"
          aria-label={`Eliminar colección "${collection.name}"`}
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </button>
      {open && (
        <div className="pl-3 space-y-1 mt-0.5">
          {projects.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 px-2 py-1 italic">Vacía</p>
          ) : projects.map(p => (
            <ProjectItem
              key={p.id}
              project={p}
              isActive={currentProject?.id === p.id}
              onLoad={onLoad}
              onDelete={onDelete}
              onMoveToCollection={onMoveToCollection}
              collections={collections}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPanel({ currentProject, onLoad, onNew, onSave }) {
  const [projects, setProjects] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [projs, cols] = await Promise.all([
        base44.entities.FormattingProject.list("-updated_date", 100),
        base44.entities.Collection.list("name", 100),
      ]);
      setProjects(projs);
      setCollections(cols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    await base44.entities.FormattingProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteCollection = async (id) => {
    await base44.entities.Collection.delete(id);
    // Unassign projects in that collection
    const affected = projects.filter(p => p.collection_id === id);
    await Promise.all(affected.map(p => base44.entities.FormattingProject.update(p.id, { collection_id: null })));
    setProjects(prev => prev.map(p => p.collection_id === id ? { ...p, collection_id: null } : p));
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveToCollection = async (projectId, collectionId) => {
    await base44.entities.FormattingProject.update(projectId, { collection_id: collectionId || null });
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, collection_id: collectionId || null } : p));
  };

  const handleCollectionCreated = (col) => {
    setCollections(prev => [...prev, col]);
    setShowNewCollection(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const uncategorized = projects.filter(p => !p.collection_id);

  return (
    <div className="w-56 flex-shrink-0 hidden lg:flex flex-col">
      <div className="sticky top-20 flex flex-col gap-2 max-h-[calc(100vh-6rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Proyectos
          </h2>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost" size="icon" className="h-6 w-6"
              title="Nueva colección"
              onClick={() => setShowNewCollection(v => !v)}
              aria-label="Nueva colección"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-6 w-6"
              title="Nuevo proyecto"
              onClick={() => { onNew(); fetchAll(); }}
              aria-label="Nuevo proyecto"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Save current */}
        <Button
          size="sm" variant="outline" className="text-xs h-8 w-full gap-1.5"
          onClick={handleSave} disabled={saving} aria-busy={saving}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Guardando…" : "Guardar"}
        </Button>

        {/* New collection form */}
        {showNewCollection && (
          <NewCollectionForm
            onSave={handleCollectionCreated}
            onCancel={() => setShowNewCollection(false)}
          />
        )}

        {/* Project list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 leading-relaxed px-2">
              Guarda tu primer proyecto para verlo aquí.
            </p>
          ) : (
            <>
              {/* Collections */}
              {collections.map(col => (
                <CollectionGroup
                  key={col.id}
                  collection={col}
                  projects={projects.filter(p => p.collection_id === col.id)}
                  currentProject={currentProject}
                  onLoad={onLoad}
                  onDelete={handleDelete}
                  onDeleteCollection={handleDeleteCollection}
                  onMoveToCollection={handleMoveToCollection}
                  collections={collections}
                />
              ))}

              {/* Uncategorized */}
              {uncategorized.length > 0 && (
                <div>
                  {collections.length > 0 && (
                    <p className="text-[11px] font-semibold text-muted-foreground/60 px-1 py-1 uppercase tracking-wider">Sin colección</p>
                  )}
                  <div className="space-y-1">
                    {uncategorized.map(p => (
                      <ProjectItem
                        key={p.id}
                        project={p}
                        isActive={currentProject?.id === p.id}
                        onLoad={onLoad}
                        onDelete={handleDelete}
                        onMoveToCollection={handleMoveToCollection}
                        collections={collections}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}