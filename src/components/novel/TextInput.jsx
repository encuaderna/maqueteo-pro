import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, FileText, Trash2 } from "lucide-react";
import { countWords } from "@/lib/formatting-utils";

export default function TextInput({ text, onChange }) {
  const textareaRef = useRef(null);
  const wordCount = countWords(text);

  const handlePaste = async () => {
    const clipText = await navigator.clipboard.readText();
    onChange(clipText);
  };

  const formatWordCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <section aria-label="Texto de la novela" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground" id="text-input-label">
          Texto de la novela
        </h2>
        {text && (
          <span className="text-xs text-muted-foreground flex items-center gap-1" aria-live="polite" aria-label={`${formatWordCount(wordCount)} palabras`}>
            <FileText className="w-3 h-3" aria-hidden="true" />
            {formatWordCount(wordCount)} palabras
          </span>
        )}
      </div>

      <Textarea
        ref={textareaRef}
        id="novel-text"
        aria-labelledby="text-input-label"
        aria-describedby="text-input-hint"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pega aquí el texto de tu novela..."
        className="min-h-[300px] text-sm leading-relaxed font-serif resize-y focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
      <p id="text-input-hint" className="text-xs text-muted-foreground">
        Los capítulos se detectan si comienzan con "Capítulo 1", "Chapter 2", etc. Las notas del autor se detectan después de "Nota del autor:" al final de cada capítulo.
      </p>

      <div className="flex gap-2" role="group" aria-label="Acciones de texto">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaste}
          className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          aria-label="Pegar texto desde el portapapeles"
        >
          <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Pegar del portapapeles
        </Button>
        {text && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-label="Limpiar todo el texto de la novela"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Limpiar
          </Button>
        )}
      </div>
    </section>
  );
}