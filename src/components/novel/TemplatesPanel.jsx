import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookTemplate, Check, Trash2, Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLang } from "@/lib/LanguageContext";

export default function TemplatesPanel({ settings, onApply }) {
  const { toast } = useToast();
  const { t } = useLang();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.entities.FormatTemplate.list("name", 50)
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      // Strip runtime-only keys (_text) before saving
      const { _text, ...cleanSettings } = settings;
      const created = await base44.entities.FormatTemplate.create({
        name: newName.trim(),
        settings: cleanSettings,
      });
      setTemplates(prev => [...prev, created]);
      setNewName("");
      setShowForm(false);
      toast({ title: t.templatesSaved, description: t.templatesSavedDesc(created.name) });
    } catch (e) {
      toast({ title: t.templatesErrorSave, description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (tpl) => {
    onApply(tpl.settings);
    toast({ title: t.templatesApplied(tpl.name) });
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    await base44.entities.FormatTemplate.delete(id);
    setTemplates(prev => prev.filter(tpl => tpl.id !== id));
    toast({ title: t.templatesDeleted(name) });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <BookTemplate className="w-3.5 h-3.5" aria-hidden="true" />
          {t.templatesTitle}
          {templates.length > 0 && (
            <span className="bg-muted text-muted-foreground text-[10px] rounded-full px-1.5 py-0.5 font-normal">
              {templates.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Save current as template */}
          {showForm ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setShowForm(false); }}
                placeholder={t.templatesNamePlaceholder}
                className="h-8 text-xs flex-1"
              />
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleSave} disabled={!newName.trim() || saving}>
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline" size="sm"
              className="w-full h-8 text-xs gap-1.5"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-3 h-3" />
              {t.templatesSaveBtn}
            </Button>
          )}

          {/* Template list */}
          {loading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              {t.templatesEmpty}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {templates.map(tpl => (
                <li key={tpl.id}>
                  <button
                    onClick={() => handleApply(tpl)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors group text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{tpl.name}</p>
                      {tpl.settings && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {tpl.settings.typography?.body || "EB Garamond"} · {tpl.settings.fontSize || 11}pt · {tpl.settings.pageSize || "letter"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.templatesApply}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, tpl.id, tpl.name)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-opacity"
                        aria-label={t.templatesDeleteLabel(tpl.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}