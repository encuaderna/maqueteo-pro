import React, { useState, useRef } from "react";
import { Clock, Search, Download, Upload, Trash2, RotateCcw, ChevronDown, ChevronRight, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Diff helper ───────────────────────────────────────────────────────────────
function diffLines(a, b) {
  const aLines = (a || "").split("\n");
  const bLines = (b || "").split("\n");
  const result = [];
  const maxLen = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < maxLen; i++) {
    const aLine = aLines[i] ?? null;
    const bLine = bLines[i] ?? null;
    if (aLine === bLine) {
      result.push({ type: "same", line: aLine, index: i });
    } else {
      if (aLine !== null) result.push({ type: "removed", line: aLine, index: i });
      if (bLine !== null) result.push({ type: "added", line: bLine, index: i });
    }
  }
  // Only show changed lines + 2 context lines around them
  const changed = new Set(result.filter(r => r.type !== "same").map(r => r.index));
  const ctx = new Set();
  changed.forEach(i => { for (let d = -2; d <= 2; d++) ctx.add(i + d); });
  return result.filter(r => ctx.has(r.index));
}

function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── Single version row ────────────────────────────────────────────────────────
function VersionRow({ entry, currentText, onRestore, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const diff = expanded ? diffLines(currentText, entry.snapshot.text) : [];
  const hasChanges = entry.snapshot.text !== currentText;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-card">
        <button
          className="flex-1 flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-ring rounded"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={`Ver diferencias de versión del ${formatTs(entry.timestamp)}`}
        >
          {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" aria-hidden="true" /> : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{entry.title}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" aria-hidden="true" />
              {formatTs(entry.timestamp)}
              <span className="ml-1">· {entry.wordCount.toLocaleString()} pal.</span>
              {!hasChanges && <span className="ml-1 text-green-600 dark:text-green-400 font-medium">(versión actual)</span>}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onRestore(entry)}
            aria-label={`Restaurar versión del ${formatTs(entry.timestamp)}`}
            title="Restaurar esta versión"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onDelete(entry.id)}
            aria-label={`Eliminar versión del ${formatTs(entry.timestamp)}`}
            title="Eliminar esta versión"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Diff viewer */}
      {expanded && (
        <div className="border-t border-border/40 bg-muted/30 p-2 max-h-48 overflow-y-auto" role="region" aria-label="Diferencias de texto">
          {diff.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Sin diferencias en el texto</p>
          ) : (
            <pre className="text-[10px] leading-relaxed font-mono whitespace-pre-wrap break-words">
              {diff.map((d, i) => (
                <span
                  key={i}
                  className={
                    d.type === "added"
                      ? "block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : d.type === "removed"
                      ? "block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 line-through"
                      : "block text-muted-foreground"
                  }
                  aria-label={d.type === "added" ? "línea añadida" : d.type === "removed" ? "línea eliminada" : undefined}
                >
                  {d.type === "added" ? "+ " : d.type === "removed" ? "− " : "  "}
                  {d.line}
                </span>
              ))}
            </pre>
          )}
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            <span className="text-green-700 dark:text-green-400 font-medium">+ añadido</span>
            {" · "}
            <span className="text-red-700 dark:text-red-400 font-medium line-through">− eliminado</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function HistoryPanel({ history, currentText, lastSavedAt, onRestore, onDelete, onClear, onExport, onImport, onClose }) {
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const importRef = useRef(null);

  const filtered = history.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
    formatTs(e.timestamp).includes(search)
  );

  return (
    <aside
      className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col"
      role="complementary"
      aria-label="Historial de versiones"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" aria-hidden="true" />
            Historial de versiones
          </h2>
          {lastSavedAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5" aria-live="polite">
              Guardado automáticamente: {lastSavedAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClose}
          aria-label="Cerrar historial"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border/50 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar versión..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Buscar en el historial de versiones"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50 flex-shrink-0 flex-wrap">
        <Button variant="outline" size="sm" className="text-[10px] h-7 px-2" onClick={onExport} aria-label="Exportar historial como JSON">
          <Download className="w-3 h-3 mr-1" aria-hidden="true" /> Exportar
        </Button>
        <Button variant="outline" size="sm" className="text-[10px] h-7 px-2" onClick={() => importRef.current?.click()} aria-label="Importar historial desde JSON">
          <Upload className="w-3 h-3 mr-1" aria-hidden="true" /> Importar
        </Button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={e => { onImport(e.target.files[0]); e.target.value = ""; }} aria-label="Seleccionar archivo de historial" />
        {history.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><AlertTriangle className="w-3 h-3 text-destructive" aria-hidden="true" />¿Borrar todo?</span>
              <Button variant="destructive" size="sm" className="text-[10px] h-7 px-2" onClick={() => { onClear(); setConfirmClear(false); }}>Sí</Button>
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2" onClick={() => setConfirmClear(false)}>No</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 text-destructive hover:text-destructive ml-auto" onClick={() => setConfirmClear(true)} aria-label="Borrar todo el historial">
              <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" /> Borrar todo
            </Button>
          )
        )}
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" role="list" aria-label={`${filtered.length} versiones guardadas`}>
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {search ? "No hay versiones que coincidan." : "Aún no hay versiones guardadas."}
          </p>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} role="listitem">
              <VersionRow
                entry={entry}
                currentText={currentText}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-border/50 flex-shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">
          {history.length}/10 versiones · guardado local
        </p>
      </div>
    </aside>
  );
}