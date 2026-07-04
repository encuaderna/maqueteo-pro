import React, { useState, useEffect } from "react";
import { Settings, Sun, Moon, Monitor, ZoomIn, ZoomOut, Keyboard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: [`${mod}`, "S"], label: "Guardar" },
  { keys: [`${mod}`, "P"], label: "Vista previa" },
  { keys: [`${mod}`, "1"], label: "Texto" },
  { keys: [`${mod}`, "2"], label: "Metadatos" },
  { keys: [`${mod}`, "3"], label: "Opciones" },
  { keys: [`${mod}`, "←"], label: "Cap. anterior" },
  { keys: [`${mod}`, "→"], label: "Cap. siguiente" },
];

const SCALES = [0.875, 1, 1.125, 1.25, 1.5];

export default function SettingsMenu() {
  const { lang, changeLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("a11y-theme") || "system");
  const [textScale, setTextScale] = useState(() => parseFloat(localStorage.getItem("a11y-text-scale") || "1"));

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
    localStorage.setItem("a11y-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 16}px`;
    localStorage.setItem("a11y-text-scale", String(textScale));
  }, [textScale]);

  const idx = SCALES.indexOf(textScale);
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(v => !v)}
        aria-label="Ajustes"
        title="Ajustes"
        aria-expanded={open}
      >
        <Settings className="w-3.5 h-3.5" aria-hidden="true" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-lg p-4 w-72 space-y-4">

            {/* Idioma */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Idioma
              </p>
              <div className="flex flex-wrap gap-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${lang === l.code ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Tamaño de texto */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <ZoomIn className="w-3 h-3" /> Tamaño de texto
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon" className="h-7 w-7"
                  onClick={() => setTextScale(SCALES[Math.max(0, idx - 1)])}
                  disabled={idx === 0} aria-label="Reducir texto"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs tabular-nums flex-1 text-center text-muted-foreground">
                  {Math.round(textScale * 100)}%
                </span>
                <Button
                  variant="outline" size="icon" className="h-7 w-7"
                  onClick={() => setTextScale(SCALES[Math.min(SCALES.length - 1, idx + 1)])}
                  disabled={idx === SCALES.length - 1} aria-label="Aumentar texto"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Tema */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sun className="w-3 h-3" /> Apariencia
              </p>
              <div className="flex gap-1">
                {[
                  { value: "light", icon: Sun, label: "Claro" },
                  { value: "dark", icon: Moon, label: "Oscuro" },
                  { value: "system", icon: Monitor, label: "Sistema" },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md border text-xs transition-colors ${theme === value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Atajos */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Keyboard className="w-3 h-3" /> Atajos de teclado
              </p>
              <ul className="space-y-1.5">
                {SHORTCUTS.map(({ keys, label }) => (
                  <li key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="flex items-center gap-0.5">
                      {keys.map((k, i) => (
                        <kbd key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded">
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
}