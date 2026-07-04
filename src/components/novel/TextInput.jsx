import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Trash2, ArrowDown } from "lucide-react";
import { countWords } from "@/lib/formatting-utils";

export default function TextInput({ text, onChange }) {
  const textareaRef = useRef(null);
  const wordCount = countWords(text);

  const handlePaste = async () => {
    const clipText = await navigator.clipboard.readText();
    onChange(clipText);
  };

  return (
    <section aria-label="Texto de la novela" className="space-y-3">
      {!text ? (
        /* Empty state — flujo integrado */
        <div className="border-2 border-dashed border-border rounded-xl overflow-hidden">
          {/* Pasos en línea */}
          <div className="flex items-stretch border-b border-border/60 text-center text-[11px] text-muted-foreground bg-muted/30">
            {[
              { n: "1", label: "Pega el texto" },
              { n: "2", label: "Ajusta detalles" },
              { n: "3", label: "Previsualiza" },
              { n: "4", label: "Exporta" },
            ].map((s, i, arr) => (
              <div key={s.n} className={`flex-1 py-2 px-1 flex flex-col items-center gap-0.5 ${i === 0 ? "text-foreground font-medium bg-muted/60" : ""} ${i < arr.length - 1 ? "border-r border-border/40" : ""}`}>
                <span className={`text-[10px] font-bold ${i === 0 ? "text-primary" : "text-muted-foreground/50"}`}>{s.n}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          {/* CTA */}
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
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {wordCount.toLocaleString()} palabras
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="text-xs text-muted-foreground h-7 gap-1 hover:text-destructive"
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
    </section>
  );
}