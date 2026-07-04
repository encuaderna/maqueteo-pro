import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor, ZoomIn, ZoomOut, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Accessibility toolbar: dark/light/system mode + text size scaler.
 * Persists preferences to localStorage.
 */
export default function AccessibilityControls() {
  const [theme, setTheme] = useState(() => localStorage.getItem("a11y-theme") || "system");
  const [textScale, setTextScale] = useState(() => parseFloat(localStorage.getItem("a11y-text-scale") || "1"));

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", isDark);
    localStorage.setItem("a11y-theme", theme);
  }, [theme]);

  // Apply text scale
  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 16}px`;
    localStorage.setItem("a11y-text-scale", String(textScale));
  }, [textScale]);

  const scales = [0.875, 1, 1.125, 1.25, 1.5];
  const currentIndex = scales.indexOf(textScale);
  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < scales.length - 1;

  const themeOptions = [
    { value: "light", icon: Sun, label: "Modo claro" },
    { value: "dark", icon: Moon, label: "Modo oscuro" },
    { value: "system", icon: Monitor, label: "Usar preferencia del sistema" },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Controles de accesibilidad"
      className="flex items-center gap-1"
    >
      {/* Text size */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        onClick={() => setTextScale(scales[Math.max(0, currentIndex - 1)])}
        disabled={!canDecrease}
        aria-label="Reducir tamaño del texto"
        title="Reducir texto"
      >
        <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <span className="sr-only">Tamaño de texto: {Math.round(textScale * 100)}%</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        onClick={() => setTextScale(scales[Math.min(scales.length - 1, currentIndex + 1)])}
        disabled={!canIncrease}
        aria-label="Aumentar tamaño del texto"
        title="Aumentar texto"
      >
        <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>

      {/* Separator */}
      <div aria-hidden="true" className="w-px h-4 bg-border mx-0.5" />

      {/* Theme toggle */}
      {themeOptions.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="icon"
          className={`h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${theme === value ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}