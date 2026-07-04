import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MetadataForm({ metadata, onChange }) {
  const update = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <section aria-label="Metadatos del libro" className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        Metadatos del libro
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="meta-title" className="text-xs">
            Título <span aria-hidden="true" className="text-destructive">*</span>
            <span className="sr-only">(requerido)</span>
          </Label>
          <Input
            id="meta-title"
            value={metadata.title || ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Mi novela"
            className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-required="true"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta-author" className="text-xs">
            Autor/a <span aria-hidden="true" className="text-destructive">*</span>
            <span className="sr-only">(requerido)</span>
          </Label>
          <Input
            id="meta-author"
            value={metadata.author || ""}
            onChange={(e) => update("author", e.target.value)}
            placeholder="Nombre del autor"
            className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-required="true"
            autoComplete="name"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="meta-year" className="text-xs">Año</Label>
          <Input
            id="meta-year"
            value={metadata.year || ""}
            onChange={(e) => update("year", e.target.value)}
            placeholder="2024"
            className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            inputMode="numeric"
            pattern="\d{4}"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta-fandom" className="text-xs">Fandom</Label>
          <Input
            id="meta-fandom"
            value={metadata.fandom || ""}
            onChange={(e) => update("fandom", e.target.value)}
            placeholder="Nombre del fandom"
            className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meta-pairings" className="text-xs">Parejas / Ships</Label>
        <Input
          id="meta-pairings"
          value={metadata.pairings || ""}
          onChange={(e) => update("pairings", e.target.value)}
          placeholder="Personaje A / Personaje B"
          className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meta-link" className="text-xs">Enlace original (AO3, etc.)</Label>
        <Input
          id="meta-link"
          type="url"
          value={metadata.original_link || ""}
          onChange={(e) => update("original_link", e.target.value)}
          placeholder="https://archiveofourown.org/works/..."
          className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          autoComplete="url"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meta-summary" className="text-xs">Resumen</Label>
        <Textarea
          id="meta-summary"
          value={metadata.summary || ""}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="Breve resumen de la historia..."
          className="text-sm min-h-[60px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meta-warnings" className="text-xs">Advertencias de contenido</Label>
        <Input
          id="meta-warnings"
          value={metadata.warnings || ""}
          onChange={(e) => update("warnings", e.target.value)}
          placeholder="Advertencias del contenido"
          className="h-9 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          aria-describedby="meta-warnings-hint"
        />
        <p id="meta-warnings-hint" className="text-xs text-muted-foreground">
          Ejemplo: violencia, lenguaje adulto
        </p>
      </div>
    </section>
  );
}