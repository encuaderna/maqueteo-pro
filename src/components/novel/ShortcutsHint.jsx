import React, { useState } from "react";
import { Keyboard } from "lucide-react";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: [`${mod}`, "S"], label: "Guardar proyecto" },
  { keys: [`${mod}`, "P"], label: "Vista previa" },
  { keys: [`${mod}`, "1"], label: "Ir a Texto" },
  { keys: [`${mod}`, "2"], label: "Ir a Metadatos" },
  { keys: [`${mod}`, "3"], label: "Ir a Opciones" },
  { keys: [`${mod}`, "←"], label: "Capítulo anterior" },
  { keys: [`${mod}`, "→"], label: "Capítulo siguiente" },
];

export default function ShortcutsHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        aria-label="Ver atajos de teclado"
        title="Atajos de teclado"
      >
        <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Atajos</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Popover */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-lg p-4 w-64">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Atajos de teclado
            </p>
            <ul className="space-y-2">
              {SHORTCUTS.map(({ keys, label }) => (
                <li key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground">{label}</span>
                  <span className="flex items-center gap-0.5 flex-shrink-0">
                    {keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-muted-foreground"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}