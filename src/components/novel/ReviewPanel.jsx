import React, { useMemo, useState } from "react";
import { applyTypography } from "@/lib/formatting-utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Computes a word-level diff between two strings.
 * Returns an array of { type: 'equal'|'remove'|'add', text } tokens.
 */
function computeDiff(original, formatted) {
  const origWords = original.split(/(\s+)/);
  const fmtWords = formatted.split(/(\s+)/);

  // Simple LCS-based diff
  const n = origWords.length;
  const m = fmtWords.length;

  // Build LCS table (cap size to avoid hanging on huge texts)
  const MAX = 4000;
  const a = origWords.slice(0, MAX);
  const b = fmtWords.slice(0, MAX);

  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const tokens = [];
  let i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      tokens.unshift({ type: "equal", text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: "add", text: b[j - 1] });
      j--;
    } else {
      tokens.unshift({ type: "remove", text: a[i - 1] });
      i--;
    }
  }

  // Append truncated tails as equal if text was capped
  if (n > MAX || m > MAX) {
    tokens.push({ type: "equal", text: "\n\n[... texto truncado en la vista de revisión ...]" });
  }

  return tokens;
}

function DiffView({ original, formatted }) {
  const tokens = useMemo(() => computeDiff(original, formatted), [original, formatted]);
  const hasChanges = tokens.some(t => t.type !== "equal");

  if (!hasChanges) {
    return (
      <p className="text-xs text-muted-foreground italic text-center py-6">
        No se detectaron cambios en este capítulo.
      </p>
    );
  }

  return (
    <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap break-words">
      {tokens.map((tok, idx) => {
        if (tok.type === "equal") return <span key={idx}>{tok.text}</span>;
        if (tok.type === "remove") return (
          <mark key={idx} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through rounded-sm px-0.5">
            {tok.text}
          </mark>
        );
        return (
          <mark key={idx} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-sm px-0.5">
            {tok.text}
          </mark>
        );
      })}
    </p>
  );
}

export default function ReviewPanel({ chapters, rawText, onClose }) {
  const [activeChapter, setActiveChapter] = useState(0);

  // Build (original, formatted) pairs per chapter
  const pairs = useMemo(() => {
    return chapters.map((ch) => {
      // The chapter content is already formatted; reconstruct the raw equivalent
      // by finding the raw segment that maps to this chapter index.
      // Since we only have the formatted content, we show raw vs formatted side-by-side.
      const formatted = ch.content || "";
      // Raw: reverse-extract from rawText using chapter boundaries (best effort)
      // Simpler: show the formatted diff against the raw segment
      return { title: ch.title, number: ch.number, formatted, notes: ch.notes || "" };
    });
  }, [chapters]);

  // Build raw segments from rawText by splitting on chapter headings
  const rawSegments = useMemo(() => {
    if (!rawText) return [];
    const parts = rawText.split(/(?=(?:Chapter|Capítulo|Cap[ií]tulo|CHAPTER|CAPÍTULO)\s*\d+)/i);
    // Remove empty first element if text starts with chapter heading
    return parts.filter(p => p.trim().length > 0).map(p => {
      // Strip the chapter heading line itself
      return p.replace(/^(?:Chapter|Capítulo|Cap[ií]tulo|CHAPTER|CAPÍTULO)\s*\d+[^\n]*\n?/i, "").trim();
    });
  }, [rawText]);

  const ch = pairs[activeChapter];
  const rawSegment = rawSegments[activeChapter] || rawText || "";
  const rawFormatted = useMemo(() => applyTypography(rawSegment), [rawSegment]);

  const totalChanges = useMemo(() => {
    const tokens = computeDiff(rawSegment, rawFormatted);
    return tokens.filter(t => t.type !== "equal").length;
  }, [rawSegment, rawFormatted]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Modo revisión</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"}
          </span>
          {totalChanges > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              {totalChanges} cambios en este capítulo
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Cerrar revisión">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chapter navigation */}
      {chapters.length > 1 && (
        <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-muted/30 flex-shrink-0 overflow-x-auto">
          <Button
            variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0"
            onClick={() => setActiveChapter(v => Math.max(0, v - 1))}
            disabled={activeChapter === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex gap-1 flex-nowrap">
            {chapters.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveChapter(i)}
                className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  i === activeChapter
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                Cap. {c.number}
              </button>
            ))}
          </div>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0"
            onClick={() => setActiveChapter(v => Math.min(chapters.length - 1, v + 1))}
            disabled={activeChapter === chapters.length - 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Columns header */}
      <div className="grid grid-cols-2 border-b border-border bg-muted/20 flex-shrink-0">
        <div className="px-6 py-2 border-r border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texto original</span>
        </div>
        <div className="px-6 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texto formateado</span>
          <span className="ml-2 text-[10px] text-muted-foreground">
            <mark className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through rounded-sm px-0.5 mr-1">eliminado</mark>
            <mark className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-sm px-0.5">añadido</mark>
          </span>
        </div>
      </div>

      {/* Side-by-side content */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-border">
        {/* Left: raw text */}
        <div className="overflow-y-auto px-6 py-5">
          {ch?.title && (
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Capítulo {ch.number}{ch.title ? ` — ${ch.title}` : ""}
            </p>
          )}
          <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap break-words text-muted-foreground">
            {rawSegment || rawText}
          </p>
        </div>

        {/* Right: diff view */}
        <div className="overflow-y-auto px-6 py-5">
          {ch?.title && (
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Capítulo {ch.number}{ch.title ? ` — ${ch.title}` : ""}
            </p>
          )}
          <DiffView original={rawSegment || rawText} formatted={ch?.formatted || ""} />
          {ch?.notes && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Notas del autor</p>
              <p className="text-sm leading-relaxed font-serif italic text-muted-foreground whitespace-pre-wrap">{ch.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}