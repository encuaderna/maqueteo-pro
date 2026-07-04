import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Eye, Settings, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { parseChapters, countWords, DEFAULT_SETTINGS } from "@/lib/formatting-utils";
import MetadataForm from "@/components/novel/MetadataForm";
import SettingsPanel from "@/components/novel/SettingsPanel";
import TextInput from "@/components/novel/TextInput";
import BookPreview from "@/components/novel/BookPreview";
import ProjectsPanel from "@/components/novel/ProjectsPanel";

export default function Home() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    year: "",
    fandom: "",
    pairings: "",
    summary: "",
    original_link: "",
    warnings: "",
  });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [showPreview, setShowPreview] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const chapters = useMemo(() => parseChapters(text), [text]);
  const wordCount = useMemo(() => countWords(text), [text]);

  const handleSaveProject = useCallback(async () => {
    if (!metadata.title && !text) {
      toast({ title: "Proyecto vacío", description: "Agrega al menos un título o texto.", variant: "destructive" });
      return;
    }
    const data = {
      title: metadata.title || "Sin título",
      author: metadata.author,
      year: metadata.year,
      fandom: metadata.fandom,
      pairings: metadata.pairings,
      summary: metadata.summary,
      original_link: metadata.original_link,
      warnings: metadata.warnings,
      word_count: countWords(text),
      settings,
      text_url: null, // text stored in settings blob for now
    };
    // Store full text in settings object to avoid large field issues
    data.settings = { ...settings, _text: text };

    try {
      if (currentProject?.id) {
        await base44.entities.FormattingProject.update(currentProject.id, data);
        setCurrentProject(prev => ({ ...prev, ...data }));
        toast({ title: "Proyecto guardado" });
      } else {
        const created = await base44.entities.FormattingProject.create(data);
        setCurrentProject(created);
        toast({ title: "Proyecto guardado" });
      }
    } catch (e) {
      toast({ title: "Error al guardar", description: e.message, variant: "destructive" });
    }
  }, [metadata, text, settings, currentProject, toast]);

  const handleLoadProject = useCallback((project) => {
    const s = project.settings || {};
    const { _text, ...cleanSettings } = s;
    setText(_text || "");
    setMetadata({
      title: project.title || "",
      author: project.author || "",
      year: project.year || "",
      fandom: project.fandom || "",
      pairings: project.pairings || "",
      summary: project.summary || "",
      original_link: project.original_link || "",
      warnings: project.warnings || "",
    });
    setSettings({ ...DEFAULT_SETTINGS, ...cleanSettings });
    setCurrentProject(project);
    setActiveTab("text");
    toast({ title: `"${project.title}" cargado` });
  }, [toast]);

  const handleNewProject = useCallback(() => {
    setText("");
    setMetadata({ title: "", author: "", year: "", fandom: "", pairings: "", summary: "", original_link: "", warnings: "" });
    setSettings(DEFAULT_SETTINGS);
    setCurrentProject(null);
    setActiveTab("text");
  }, []);

  const handleGeneratePdf = useCallback(async () => {
    if (!text.trim()) {
      toast({ title: "Sin texto", description: "Pega el texto de tu novela primero.", variant: "destructive" });
      return;
    }
    if (!metadata.title) {
      toast({ title: "Sin título", description: "Ingresa al menos el título del libro.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("generateBookPdf", {
        chapters,
        metadata,
        settings,
      });

      // response.data is the PDF binary
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${metadata.title || "libro"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "¡Listo!", description: "Tu libro se está descargando." });
    } catch (err) {
      toast({
        title: "Error al generar PDF",
        description: err.message || "Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [text, metadata, settings, chapters, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-foreground" />
            <h1 className="text-base font-heading font-semibold tracking-tight">
              Novelista
            </h1>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium px-1.5 py-0.5 bg-muted rounded">
              Formateador
            </span>
            {currentProject && (
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[160px]">
                / {currentProject.title || "Sin título"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {text && (
              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} · {wordCount.toLocaleString()} palabras
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!text}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              {showPreview ? "Ocultar" : "Vista previa"}
            </Button>
            <Button
              size="sm"
              className="text-xs h-8"
              onClick={handleGeneratePdf}
              disabled={isGenerating || !text}
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              {isGenerating ? "Generando..." : "Descargar PDF"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Projects sidebar */}
          <ProjectsPanel
            currentProject={currentProject}
            onLoad={handleLoadProject}
            onNew={handleNewProject}
            onSave={handleSaveProject}
          />
          {/* Left panel: input & config */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 h-9 mb-4">
                <TabsTrigger value="text" className="text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Metadatos
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Opciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-0">
                <TextInput text={text} onChange={setText} />
              </TabsContent>

              <TabsContent value="metadata" className="mt-0">
                <MetadataForm metadata={metadata} onChange={setMetadata} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsPanel settings={settings} onChange={setSettings} />
              </TabsContent>
            </Tabs>

            {/* Chapter summary */}
            {chapters.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Capítulos detectados
                </h4>
                <div className="space-y-1.5">
                  {chapters.map((ch, i) => (
                    <div key={i} className="flex items-baseline justify-between text-sm">
                      <span className="text-foreground">
                        <span className="text-muted-foreground">Cap. {ch.number}</span>
                        {ch.title && <span className="ml-2">{ch.title}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {countWords(ch.content).toLocaleString()} palabras
                        {ch.notes && " · con notas"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: preview */}
          {showPreview && text && (
            <div className="lg:w-[600px] flex-shrink-0">
              <div className="sticky top-20">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                    Vista previa del libro
                  </h3>
                  <BookPreview
                    chapters={chapters}
                    metadata={metadata}
                    settings={settings}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!text && (
          <div className="mt-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/60 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-heading font-medium mb-2">
              Formatea tu novela para impresión
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Pega el texto de tu historia, configura los metadatos y opciones de formato,
              y descarga un PDF listo para imprimir con tipografía profesional.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs text-muted-foreground">
              {["Comillas tipográficas", "Em dashes", "Letra capital", "Encabezados", "Notas del autor", "Separadores de escena"].map(f => (
                <span key={f} className="px-2.5 py-1 rounded-full bg-muted/60 border border-border/50">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}