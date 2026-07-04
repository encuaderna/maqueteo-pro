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
        /* Empty state — guided call to action */
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <ClipboardPaste className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Pega el texto de tu novela</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Pega el texto copiado desde su plataforma de origen aquí. El sistema detectará los capítulos automáticamente.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              size="sm"
              onClick={handlePaste}
              className="text-xs gap-1.5"
              aria-label="Pegar texto desde el portapapeles"
            >
              <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
              Pegar del portapapeles
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => textareaRef.current?.focus()}
              aria-label="Escribir texto directamente"
            >
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              Escribir aquí
            </Button>
          </div>
          {/* Hidden textarea still focusable for keyboard/screen reader users */}
          <Textarea
            ref={textareaRef}
            id="novel-text"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="O empieza a escribir directamente..."
            className="min-h-[120px] text-sm leading-relaxed font-serif resize-y mt-2"
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
            className="min-h-[400px] text-sm leading-relaxed font-serif resize-y"
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