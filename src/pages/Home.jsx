import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Eye, Settings, FileText, Loader2, History, SplitSquareHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { parseChapters, countWords, DEFAULT_SETTINGS } from "@/lib/formatting-utils";
import MetadataForm from "@/components/novel/MetadataForm";
import SettingsPanel from "@/components/novel/SettingsPanel";
import TextInput from "@/components/novel/TextInput";
import BookPreview from "@/components/novel/BookPreview";
import ProjectsPanel from "@/components/novel/ProjectsPanel";
import AccessibilityControls from "@/components/novel/AccessibilityControls";
import HistoryPanel from "@/components/novel/HistoryPanel";
import ReviewPanel from "@/components/novel/ReviewPanel";
import { useLocalHistory } from "@/hooks/useLocalHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import ShortcutsHint from "@/components/novel/ShortcutsHint";
import QuickNotes from "@/components/novel/QuickNotes";
import LanguageSelector from "@/components/novel/LanguageSelector";
import { useLang } from "@/lib/LanguageContext";

export default function Home() {
  const { toast } = useToast();
  const { t } = useLang();
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
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [showPreview, setShowPreview] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { history, lastSavedAt, deleteVersion, clearHistory, exportHistory, importHistory } =
    useLocalHistory(text, metadata, settings);

  // Chapter navigation state (for keyboard shortcuts)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const handleRestoreVersion = useCallback((entry) => {
    const { text: t, metadata: m, settings: s } = entry.snapshot;
    setText(t || "");
    setMetadata(m || {});
    setSettings({ ...DEFAULT_SETTINGS, ...(s || {}) });
    setShowHistory(false);
    toast({ title: "Versión restaurada", description: `Restaurado desde ${new Date(entry.timestamp).toLocaleTimeString("es-CL")}` });
  }, [toast]);

  const handleImportHistory = useCallback(async (file) => {
    if (!file) return;
    try {
      const count = await importHistory(file);
      toast({ title: "Historial importado", description: `${count} versiones cargadas.` });
    } catch {
      toast({ title: "Error al importar", description: "El archivo no es válido.", variant: "destructive" });
    }
  }, [importHistory, toast]);

  const chapters = useMemo(() => parseChapters(text), [text]);
  const wordCount = useMemo(() => countWords(text), [text]);

  const handleSaveProject = useCallback(async () => {
    if (!metadata.title && !text) {
      toast({ title: t.toastEmptyProject, description: t.toastEmptyProjectDesc, variant: "destructive" });
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
        toast({ title: t.toastSaved });
      } else {
        const created = await base44.entities.FormattingProject.create(data);
        setCurrentProject(created);
        toast({ title: t.toastSaved });
      }
    } catch (e) {
      toast({ title: t.toastErrorSave, description: e.message, variant: "destructive" });
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
    toast({ title: t.toastLoaded(project.title || t.withoutTitle) });
  }, [toast]);

  useKeyboardShortcuts({
    onSave: handleSaveProject,
    onTogglePreview: () => text && setShowPreview(v => !v),
    onSwitchTab: setActiveTab,
    onPrevChapter: () => setActiveChapterIndex(i => Math.max(0, i - 1)),
    onNextChapter: () => setActiveChapterIndex(i => Math.min(chapters.length - 1, i + 1)),
  });

  const handleNewProject = useCallback(() => {
    setText("");
    setMetadata({ title: "", author: "", year: "", fandom: "", pairings: "", summary: "", original_link: "", warnings: "" });
    setSettings(DEFAULT_SETTINGS);
    setCurrentProject(null);
    setActiveTab("text");
  }, []);

  const handleGeneratePdf = useCallback(async () => {
    if (!text.trim()) {
      toast({ title: t.toastNoText, description: t.toastNoTextDesc, variant: "destructive" });
      return;
    }
    if (!metadata.title) {
      toast({ title: t.toastNoTitle, description: t.toastNoTitleDesc, variant: "destructive" });
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

      toast({ title: t.toastDone, description: t.toastPdfDesc });
    } catch (err) {
      toast({
        title: t.toastErrorPdf,
        description: err.message || t.toastRetry,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [text, metadata, settings, chapters, toast]);

  const handleGenerateDocx = useCallback(async () => {
    if (!text.trim()) {
      toast({ title: t.toastNoText, description: t.toastNoTextDesc, variant: "destructive" });
      return;
    }
    if (!metadata.title) {
      toast({ title: t.toastNoTitle, description: t.toastNoTitleDesc, variant: "destructive" });
      return;
    }
    setIsGeneratingDocx(true);
    try {
      const response = await base44.functions.invoke("generateBookDocx", {
        chapters,
        metadata,
        settings,
      });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${metadata.title || "libro"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: t.toastDone, description: t.toastWordDesc });
    } catch (err) {
      toast({ title: t.toastErrorWord, description: err.message || t.toastRetry, variant: "destructive" });
    } finally {
      setIsGeneratingDocx(false);
    }
  }, [text, metadata, settings, chapters, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content — visible on focus (keyboard/screen reader) */}
      <a href="#main-content" className="skip-link">
        {t.skipToMain}
      </a>

      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-foreground" aria-hidden="true" />
            <span className="font-heading font-semibold tracking-tight" aria-label={t.appName}>
              {t.appName}
            </span>
            {currentProject && (
              <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[160px]" aria-live="polite">
                · {currentProject.title || t.withoutTitle}
              </span>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Stats pill — only when there's content */}
            {text && (
              <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full" aria-live="polite">
                <FileText className="w-3 h-3" aria-hidden="true" />
                {t.chaptersCount(chapters.length)} · {t.words(wordCount.toLocaleString())}
              </span>
            )}

            <div aria-hidden="true" className="w-px h-4 bg-border hidden sm:block" />

            {/* History */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs h-8 gap-1.5 ${showHistory ? "bg-accent text-accent-foreground" : ""}`}
              onClick={() => setShowHistory(v => !v)}
              aria-pressed={showHistory}
              aria-label={t.history}
            >
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.history}</span>
              {history.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] rounded-full px-1 min-w-[16px] text-center leading-4" aria-hidden="true">
                  {history.length}
                </span>
              )}
            </Button>

            {/* Review mode */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => setShowReview(true)}
              disabled={!text}
              aria-label={t.review}
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.review}</span>
            </Button>

            {/* Preview toggle */}
            <Button
              variant={showPreview ? "secondary" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!text}
              aria-pressed={showPreview}
              aria-label={showPreview ? t.hidePreview : t.showPreview}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              {showPreview ? t.hidePreview : t.showPreview}
            </Button>

            {/* Download buttons */}
            <div className="flex items-center gap-2" role="group" aria-label="Opciones de descarga">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={handleGenerateDocx}
                disabled={isGenerating || isGeneratingDocx || !text}
                aria-busy={isGeneratingDocx}
              >
                {isGeneratingDocx ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <FileText className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                )}
                {isGeneratingDocx ? t.generatingWord : "Word"}
              </Button>
              <Button
                size="sm"
                className="text-xs h-8"
                onClick={handleGeneratePdf}
                disabled={isGenerating || isGeneratingDocx || !text}
                aria-busy={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                )}
                {isGenerating ? t.generatingPdf : "PDF"}
              </Button>
            </div>

            <div aria-hidden="true" className="w-px h-4 bg-border hidden sm:block" />
            <ShortcutsHint />
            <AccessibilityControls />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Projects sidebar */}
          <nav aria-label="Proyectos guardados">
            <ProjectsPanel
              currentProject={currentProject}
              onLoad={handleLoadProject}
              onNew={handleNewProject}
              onSave={handleSaveProject}
            />
          </nav>

          {/* Main workspace */}
          <main id="main-content" className="flex-1 min-w-0" aria-label="Editor de novela" tabIndex={-1}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 h-9 mb-4" aria-label="Secciones del editor">
                <TabsTrigger value="text" className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                  <FileText className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Metadatos
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                  <Settings className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Opciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-0 adhd-focus-section">
                <TextInput text={text} onChange={setText} />
              </TabsContent>

              <TabsContent value="metadata" className="mt-0 adhd-focus-section">
                <MetadataForm metadata={metadata} onChange={setMetadata} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 adhd-focus-section">
                <SettingsPanel settings={settings} onChange={setSettings} />
              </TabsContent>
            </Tabs>

            {/* Quick notes for active project */}
            <QuickNotes
              project={currentProject}
              onNotesChange={(notes) => setCurrentProject(prev => prev ? { ...prev, notes } : prev)}
            />

            {/* Chapter summary */}
            {chapters.length > 0 && (
              <section aria-label="Capítulos detectados" className="mt-4 rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {chapters.length} {chapters.length === 1 ? "capítulo detectado" : "capítulos detectados"}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">{wordCount.toLocaleString()} palabras en total</span>
                </div>
                <ol className="divide-y divide-border/60">
                  {chapters.map((ch, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30 transition-colors">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground tabular-nums w-8">#{ch.number}</span>
                        <span className="text-foreground truncate max-w-[200px]">{ch.title || <span className="text-muted-foreground italic">Sin título</span>}</span>
                        {ch.notes && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">notas</span>}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0 ml-4">
                        {countWords(ch.content).toLocaleString()} pal.
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </main>

          {/* Stats sidebar */}
          {text && (
            <aside aria-label="Estadísticas del texto" className="lg:w-44 flex-shrink-0 hidden lg:block">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-4 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estadísticas</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Palabras</p>
                    <p className="text-2xl font-heading font-semibold tabular-nums leading-none">{wordCount.toLocaleString("es-CL")}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Capítulos</p>
                    <p className="text-2xl font-heading font-semibold tabular-nums leading-none">{chapters.length}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Lectura est.</p>
                    {(() => {
                      const mins = Math.ceil(wordCount / 200);
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      return (
                        <>
                          <p className="text-2xl font-heading font-semibold tabular-nums leading-none">
                            {h > 0 ? `${h}h ${m}m` : `${m}m`}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">a 200 pal/min</p>
                        </>
                      );
                    })()}
                  </div>
                  {chapters.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Promedio / cap.</p>
                        <p className="text-lg font-heading font-semibold tabular-nums leading-none">
                          {Math.round(wordCount / chapters.length).toLocaleString("es-CL")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">palabras</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Right panel: preview */}
          {showPreview && text && (
            <aside aria-label="Vista previa del libro" className="lg:w-[600px] flex-shrink-0">
              <div className="sticky top-20">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                    Vista previa del libro
                  </h2>
                  <BookPreview
                    chapters={chapters}
                    metadata={metadata}
                    settings={settings}
                  />
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Empty state — shown only when no text and no chapters */}
        {!text && (
          <section aria-label="Bienvenida" className="mt-10 text-center max-w-lg mx-auto">
            <h2 className="text-base font-heading font-semibold mb-1">Formatea tu novela para impresión</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pega el texto, completa los metadatos y descarga un PDF o Word con tipografía profesional.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-6 text-left">
              {[
                { step: "1", label: "Pega el texto", desc: "Desde cualquier fuente" },
                { step: "2", label: "Ajusta los detalles", desc: "Título, autor, formato" },
                { step: "3", label: "Descarga", desc: "PDF o Word listo para imprimir" },
              ].map(({ step, label, desc }) => (
                <div key={step} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-xs font-bold text-muted-foreground mb-1">Paso {step}</div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review panel */}
      {showReview && chapters.length > 0 && (
        <ReviewPanel
          chapters={chapters}
          rawText={text}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          currentText={text}
          lastSavedAt={lastSavedAt}
          onRestore={handleRestoreVersion}
          onDelete={deleteVersion}
          onClear={clearHistory}
          onExport={exportHistory}
          onImport={handleImportHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}