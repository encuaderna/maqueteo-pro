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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Texto de la novela
        </h3>
        <div className="flex items-center gap-2">
          {text && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {formatWordCount(wordCount)} palabras
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pega aquí el texto de tu novela...&#10;&#10;Los capítulos se detectan automáticamente si comienzan con 'Capítulo 1', 'Chapter 2', etc.&#10;&#10;Las notas del autor se detectan si están después de 'Nota del autor:' o 'Author's Note:' al final de cada capítulo."
          className="min-h-[300px] text-sm leading-relaxed font-serif resize-y"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaste}
          className="text-xs"
        >
          <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" />
          Pegar del portapapeles
        </Button>
        {text && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}