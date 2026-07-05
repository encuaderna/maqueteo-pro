import React, { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Trash2, ArrowDown } from "lucide-react";
import { countWords } from "@/lib/formatting-utils";
import ClearTextDialog from "@/components/novel/ClearTextDialog";

// Estimate pages based on format settings
function estimatePages(wordCount, settings = {}) {
  const fontSize = settings.fontSize || 11;
  const lineSpacing = settings.lineSpacing || 1.5;
  const margins = settings.margins || { top: 1, bottom: 0.7, sides: 0.75 };
  const pageSize = settings.pageSize || "letter";

  // Page dimensions in inches
  const pageH = pageSize === "a4" ? 11.69 : 11;
  const pageW = pageSize === "a4" ? 8.27 : 8.5;

  const usableW = pageW - (margins.sides || 0.75) * 2;
  const usableH = pageH - (margins.top || 1) - (margins.bottom || 0.7);

  // Characters per line ≈ usableW * 72 / (fontSize * 0.6)
  const charsPerLine = Math.floor((usableW * 72) / (fontSize * 0.6));
  // Lines per page
  const lineHeight = fontSize * lineSpacing;
  const linesPerPage = Math.floor((usableH * 72) / lineHeight);
  // Words per line ≈ charsPerLine / 5.5 average word length
  const wordsPerLine = charsPerLine / 5.5;
  const wordsPerPage = Math.floor(wordsPerLine * linesPerPage);

  if (wordsPerPage <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / wordsPerPage));
}

export default function TextInput({ text, onChange, settings }) {
  const textareaRef = useRef(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const wordCount = countWords(text);
  const pageCount = estimatePages(wordCount, settings);

  const handlePaste = async () => {
    const clipText = await navigator.clipboard.readText();
    onChange(clipText);
  };

  const handleClearConfirm = () => {
    onChange("");
    setShowClearDialog(false);
  };

  return (
    <section aria-label="Texto de la novela" className="space-y-3">
      {!text ? (
        /* Empty state */
        <div className="border-2 border-dashed border-border rounded-xl overflow-hidden">
          <div className="flex items-stretch border-b border-border/60 text-center text-[11px] text-muted-foreground bg-muted/30">
            {[
              { n: "1", label: "Pega el texto" },
              { n: "2", label: "Ajusta detalles" },
              { n: "3", label: "Previsualiza" },
              { n: "4", label: "Exporta" },
            ].map((s, i, arr) => (
              <div
                key={s.n}
                className={`flex-1 py-2 px-1 flex flex-col items-center gap-0.5 ${i === 0 ? "text-foreground font-medium bg-muted/60" : ""} ${i < arr.length - 1 ? "border-r border-border/40" : ""}`}
              >
                <span className={`text-[10px] font-bold ${i === 0 ? "text-primary" : "text-muted-foreground/50"}`}>{s.n}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center">
              <ClipboardPaste className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Pega tu texto — los capítulos se detectan automáticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="sm" onClick={handlePaste} className="text-xs gap-1.5" aria-label="Pegar texto desde el portapapeles">
                <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
                Pegar del portapapeles
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => textareaRef.current?.focus()} aria-label="Escribir texto directamente">
                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                Escribir aquí
              </Button>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            id="novel-text"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="O empieza a escribir directamente..."
            className="min-h-[100px] text-sm leading-relaxed font-serif resize-y border-t border-border/40 rounded-none border-x-0 border-b-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Área de texto de la novela"
          />
        </div>
      ) : (
        /* Content state */
        <>
          {/* Stats bar + clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" aria-live="polite">
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span>
                {" palabras"}
              </span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">~{pageCount}</span>
                {" " + (pageCount === 1 ? "página" : "páginas")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="text-xs text-muted-foreground h-7 gap-1 hover:text-destructive hover:bg-destructive/5"
              aria-label="Limpiar todo el texto"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              Limpiar
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            id="novel-text"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Pega aquí el texto de tu novela..."
            className="min-h-[520px] text-sm leading-relaxed font-serif resize-y"
            aria-label="Texto de la novela"
          />

          <p className="text-xs text-muted-foreground leading-relaxed">
            Capítulos detectados por "Capítulo 1", "Chapter 2", etc. Notas del autor después de "Nota del autor:".
          </p>
        </>
      )}

      <ClearTextDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearConfirm}
      />
    </section>
  );
}