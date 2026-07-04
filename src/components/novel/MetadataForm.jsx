import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MetadataForm({ metadata, onChange }) {
  const update = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        Metadatos del libro
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Título *</Label>
          <Input
            value={metadata.title || ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Mi novela"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Autor/a *</Label>
          <Input
            value={metadata.author || ""}
            onChange={(e) => update("author", e.target.value)}
            placeholder="Nombre del autor"
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Año</Label>
          <Input
            value={metadata.year || ""}
            onChange={(e) => update("year", e.target.value)}
            placeholder="2024"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fandom</Label>
          <Input
            value={metadata.fandom || ""}
            onChange={(e) => update("fandom", e.target.value)}
            placeholder="Nombre del fandom"
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Parejas / Ships</Label>
        <Input
          value={metadata.pairings || ""}
          onChange={(e) => update("pairings", e.target.value)}
          placeholder="Personaje A / Personaje B"
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Enlace original (AO3, etc.)</Label>
        <Input
          value={metadata.original_link || ""}
          onChange={(e) => update("original_link", e.target.value)}
          placeholder="https://archiveofourown.org/works/..."
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Resumen</Label>
        <Textarea
          value={metadata.summary || ""}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="Breve resumen de la historia..."
          className="text-sm min-h-[60px]"
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Advertencias</Label>
        <Input
          value={metadata.warnings || ""}
          onChange={(e) => update("warnings", e.target.value)}
          placeholder="Advertencias del contenido"
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}