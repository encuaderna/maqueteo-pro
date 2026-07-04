import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Check, Loader2 } from "lucide-react";

export default function QuickNotes({ project, onNotesChange }) {
  const [notes, setNotes] = useState(project?.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef(null);
  const prevProjectId = useRef(project?.id);

  // Sync notes when project changes
  useEffect(() => {
    if (project?.id !== prevProjectId.current) {
      prevProjectId.current = project?.id;
      setNotes(project?.notes || "");
      setSaved(false);
    }
  }, [project]);

  const saveNotes = useCallback(async (value) => {
    if (!project?.id) return;
    setSaving(true);
    try {
      await base44.entities.FormattingProject.update(project.id, { notes: value });
      onNotesChange?.(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [project?.id, onNotesChange]);

  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNotes(val), 1200);
  };

  if (!project?.id) return null;

  return (
    <section aria-label="Notas rápidas del proyecto" className="mt-4 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" aria-hidden="true" />
          Notas rápidas
        </h2>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          {saving && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
          {saved && !saving && <><Check className="w-2.5 h-2.5 text-green-500" /> Guardado</>}
          {!saving && !saved && "Se guarda automáticamente"}
        </span>
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Ideas de trama, cambios pendientes, recordatorios… Escribe libremente."
        className="w-full min-h-[96px] resize-y px-4 py-3 text-xs text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset leading-relaxed"
        aria-label="Notas rápidas del proyecto"
      />
    </section>
  );
}