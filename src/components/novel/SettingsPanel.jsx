import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCENE_SEPARATORS } from "@/lib/formatting-utils";
import { Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import FontPicker from "@/components/novel/FontPicker";

export default function SettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  const updateTypography = (role, fontName) => {
    onChange({ ...settings, typography: { ...settings.typography, [role]: fontName } });
  };

  const handleCustomSeparator = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("customSeparatorUrl", file_url);
    update("sceneSeparator", "custom");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        Configuración
      </h3>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Tamaño de fuente</Label>
          <span className="text-xs text-muted-foreground">{settings.fontSize}pt</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => update("fontSize", v)}
          min={10}
          max={12}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Line Spacing */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Interlineado</Label>
          <span className="text-xs text-muted-foreground">{settings.lineSpacing}</span>
        </div>
        <Slider
          value={[settings.lineSpacing]}
          onValueChange={([v]) => update("lineSpacing", v)}
          min={1.5}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Margins */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Márgenes laterales</Label>
          <span className="text-xs text-muted-foreground">{settings.margins.sides}"</span>
        </div>
        <Slider
          value={[settings.margins.sides]}
          onValueChange={([v]) => update("margins", { ...settings.margins, sides: v })}
          min={0.5}
          max={1.5}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Page Size */}
      <div className="space-y-2">
        <Label className="text-xs">Tamaño de página</Label>
        <Select value={settings.pageSize} onValueChange={(v) => update("pageSize", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="letter">Carta (8.5" × 11")</SelectItem>
            <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Paper Color */}
      <div className="space-y-2">
        <Label className="text-xs">Color de papel</Label>
        <RadioGroup
          value={settings.paperColor}
          onValueChange={(v) => update("paperColor", v)}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="white" id="paper-white" />
            <Label htmlFor="paper-white" className="text-xs cursor-pointer flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-gray-300 bg-white inline-block" />
              Blanco
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="cream" id="paper-cream" />
            <Label htmlFor="paper-cream" className="text-xs cursor-pointer flex items-center gap-1.5">
              <span className="w-4 h-4 rounded border border-gray-300 inline-block" style={{ backgroundColor: "#FDF5E6" }} />
              Crema
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Tabla de contenidos</Label>
          <Switch checked={settings.showToc} onCheckedChange={(v) => update("showToc", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Metadatos AO3</Label>
          <Switch checked={settings.showMetadata} onCheckedChange={(v) => update("showMetadata", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Letra capital (drop cap)</Label>
          <Switch checked={settings.showDropCap} onCheckedChange={(v) => update("showDropCap", v)} />
        </div>
      </div>

      {/* Drop Cap Options */}
      {settings.showDropCap && (
        <div className="space-y-3 pl-3 border-l-2 border-border/50">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Opciones de letra capital</Label>

          <div className="space-y-1.5">
            <Label className="text-xs">Fuente</Label>
            <Select
              value={settings.dropCap?.font || 'Garamond'}
              onValueChange={(v) => update("dropCap", { ...settings.dropCap, font: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Garamond">Garamond</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="serif">Serif genérica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Tamaño (× fuente base)</Label>
              <span className="text-xs text-muted-foreground">{settings.dropCap?.sizeMultiplier || 3}×</span>
            </div>
            <Slider
              value={[settings.dropCap?.sizeMultiplier || 3]}
              onValueChange={([v]) => update("dropCap", { ...settings.dropCap, sizeMultiplier: v })}
              min={2}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Altura en líneas</Label>
              <span className="text-xs text-muted-foreground">{settings.dropCap?.linesHigh || 2} líneas</span>
            </div>
            <Slider
              value={[settings.dropCap?.linesHigh || 2]}
              onValueChange={([v]) => update("dropCap", { ...settings.dropCap, linesHigh: v })}
              min={2}
              max={4}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Author Notes Style */}
      <div className="space-y-2">
        <Label className="text-xs">Estilo de notas del autor</Label>
        <RadioGroup
          value={settings.authorNotesStyle}
          onValueChange={(v) => update("authorNotesStyle", v)}
          className="space-y-2"
        >
          <div className="flex items-start gap-2">
            <RadioGroupItem value="A" id="notes-a" className="mt-0.5" />
            <Label htmlFor="notes-a" className="text-xs cursor-pointer leading-relaxed">
              <span className="font-medium">Sutil</span> — cursiva centrada con líneas punteadas
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <RadioGroupItem value="B" id="notes-b" className="mt-0.5" />
            <Label htmlFor="notes-b" className="text-xs cursor-pointer leading-relaxed">
              <span className="font-medium">Recuadro</span> — caja con fondo gris
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Tipografías</Label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Selecciona una fuente para cada elemento. La previsualización se actualiza en tiempo real.
        </p>
        <div className="space-y-3 relative">
          <FontPicker
            label="Cuerpo de texto"
            value={settings.typography?.body || 'EB Garamond'}
            onChange={(v) => updateTypography('body', v)}
          />
          <FontPicker
            label="Títulos de capítulo"
            value={settings.typography?.chapter || 'EB Garamond'}
            onChange={(v) => updateTypography('chapter', v)}
          />
          <FontPicker
            label="Portada / Título principal"
            value={settings.typography?.title || 'EB Garamond'}
            onChange={(v) => updateTypography('title', v)}
          />
        </div>
      </div>

      {/* Scene Separator */}
      <div className="space-y-3">
        <Label className="text-xs">Separador de escenas</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SCENE_SEPARATORS).map(([key, svg]) => (
            <button
              key={key}
              onClick={() => update("sceneSeparator", key)}
              className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center h-12 ${
                settings.sceneSeparator === key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleCustomSeparator}
              className="hidden"
            />
            <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
              <span><Upload className="w-3 h-3 mr-1.5" /> Subir separador personalizado</span>
            </Button>
          </label>
          {settings.customSeparatorUrl && (
            <button
              onClick={() => update("sceneSeparator", "custom")}
              className={`p-2 rounded-lg border-2 h-12 w-16 flex items-center justify-center ${
                settings.sceneSeparator === "custom"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <img src={settings.customSeparatorUrl} alt="Custom" className="max-h-6 max-w-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}