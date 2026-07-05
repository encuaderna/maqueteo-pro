import React from "react";
import { Check, Circle } from "lucide-react";

export default function SaveIndicator({ isSaved }) {
  if (isSaved) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400" aria-live="polite" aria-label="Guardado">
        <Check className="w-3 h-3" />
        <span className="hidden sm:inline">Guardado</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-yellow-500 dark:text-yellow-400" aria-live="polite" aria-label="Sin guardar">
      <Circle className="w-2.5 h-2.5 fill-current" />
      <span className="hidden sm:inline">Sin guardar</span>
    </span>
  );
}