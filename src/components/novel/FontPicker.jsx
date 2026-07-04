import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X, Check, Type } from "lucide-react";

// Curated list of Google Fonts suitable for book typography
const GOOGLE_FONTS = [
  // Serif (ideal para cuerpo de texto)
  { name: "EB Garamond", category: "serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Crimson Text", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "GFS Didot", category: "serif" },
  { name: "Cardo", category: "serif" },
  { name: "Spectral", category: "serif" },
  { name: "Source Serif 4", category: "serif" },
  { name: "Vollkorn", category: "serif" },
  { name: "Alegreya", category: "serif" },
  { name: "Gentium Book Plus", category: "serif" },
  { name: "Old Standard TT", category: "serif" },
  // Sans-serif
  { name: "Inter", category: "sans-serif" },
  { name: "Nunito", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Josefin Sans", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  // Display / decorativas
  { name: "Cinzel", category: "display" },
  { name: "Playfair Display SC", category: "display" },
  { name: "Cormorant SC", category: "display" },
  { name: "Rozha One", category: "display" },
  { name: "Uncial Antiqua", category: "display" },
  // Script / cursiva
  { name: "Dancing Script", category: "script" },
  { name: "Parisienne", category: "script" },
  { name: "Great Vibes", category: "script" },
  { name: "Satisfy", category: "script" },
];

const CATEGORY_LABELS = {
  serif: "Serif",
  "sans-serif": "Sans-Serif",
  display: "Display",
  script: "Script",
};

const PREVIEW_TEXT = "El rey y la reina vivían felices";

function loadGoogleFont(fontName) {
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export default function FontPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const containerRef = useRef(null);

  // Load fonts when picker opens
  useEffect(() => {
    if (!open) return;
    const toLoad = GOOGLE_FONTS.filter(f => !loadedFonts.has(f.name));
    toLoad.forEach(f => loadGoogleFont(f.name));
    setLoadedFonts(prev => new Set([...prev, ...toLoad.map(f => f.name)]));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = GOOGLE_FONTS.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || f.category === category;
    return matchSearch && matchCat;
  });

  const handleSelect = (fontName) => {
    onChange(fontName);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && <Label className="text-xs">{label}</Label>}
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 flex items-center justify-between rounded-md border border-input bg-background hover:bg-accent transition-colors text-sm"
        style={{ fontFamily: value ? `'${value}', serif` : "inherit" }}
      >
        <span>{value || "Seleccionar fuente..."}</span>
        <Type className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-80 rounded-lg border border-border bg-background shadow-xl flex flex-col"
          style={{ maxHeight: 420 }}>
          {/* Search */}
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar fuente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs outline-none bg-transparent placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
            {["all", "serif", "sans-serif", "display", "script"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 rounded text-xs whitespace-nowrap transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat === "all" ? "Todas" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Font list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin resultados</p>
            ) : (
              filtered.map(font => (
                <button
                  key={font.name}
                  onClick={() => handleSelect(font.name)}
                  className={`w-full px-3 py-2.5 flex flex-col items-start hover:bg-accent transition-colors text-left border-b border-border/40 last:border-0 ${
                    value === font.name ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs text-muted-foreground">{font.name}</span>
                    {value === font.name && <Check className="w-3 h-3 text-primary" />}
                  </div>
                  <span
                    style={{ fontFamily: `'${font.name}', ${font.category}`, fontSize: "15px", lineHeight: 1.3 }}
                    className="text-foreground"
                  >
                    {PREVIEW_TEXT}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}