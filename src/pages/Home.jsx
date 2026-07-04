import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Eye, FileText, Loader2, History, SplitSquareHorizontal, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { parseChapters, countWords, DEFAULT_SETTINGS } from "@/lib/formatting-utils";
import MetadataForm from "@/components/novel/MetadataForm";
import SettingsPanel from "@/components/novel/SettingsPanel";
import TextInput from "@/components/novel/TextInput";
import BookPreview from "@/components/novel/BookPreview";
import ProjectsPanel from "@/components/novel/ProjectsPanel";
import HistoryPanel from "@/components/novel/HistoryPanel";
import ReviewPanel from "@/components/novel/ReviewPanel";
import { useLocalHistory } from "@/hooks/useLocalHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import QuickNotes from "@/components/novel/QuickNotes";
import KanbanBoard from "@/components/novel/KanbanBoard";
import InstallPWA from "@/components/InstallPWA";
import SettingsMenu from "@/components/novel/SettingsMenu";
import { useLang } from "@/lib/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [showKanban, setShowKanban] = useState(false);

  const { history, lastSavedAt, deleteVersion, clearHistory, exportHistory, importHistory } =
    useLocalHistory(text, metadata, settings);

  // Chapter navigation state (for keyboard shortcuts)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const handleRestoreVersion = useCallback((entry) => {
    const { text: tv, metadata: m, settings: s } = entry.snapshot;
    setText(tv || "");
    setMetadata(m || {});
    setSettings({ ...DEFAULT_SETTINGS, ...(s || {}) });
    setShowHistory(false);
    toast({ title: t.toastVersionRestored, description: t.toastVersionRestoredDesc(new Date(entry.timestamp).toLocaleTimeString()) });
  }, [toast, t]);

  const handleImportHistory = useCallback(async (file) => {
    if (!file) return;
    try {
      const count = await importHistory(file);
      toast({ title: t.toastHistoryImported, description: t.toastHistoryImportedDesc(count) });
    } catch {
      toast({ title: t.toastHistoryImportError, description: t.toastHistoryImportErrorDesc, variant: "destructive" });
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
  }, [toast, t]);

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

            {/* Kanban board */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => setShowKanban(true)}
              aria-label={t.kanbanBtn}
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5 rotate-90" aria-hidden="true" />
              <span className="hidden sm:inline">{t.kanbanBtn}</span>
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

            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  disabled={isGenerating || isGeneratingDocx || !text}
                  aria-label="Exportar documento"
                >
                  {(isGenerating || isGeneratingDocx) ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {isGenerating ? t.generatingPdf : isGeneratingDocx ? t.generatingWord : t.exportBtn ?? "Exportar"}
                  <ChevronDown className="w-3 h-3 opacity-60" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onClick={handleGeneratePdf} disabled={isGenerating || isGeneratingDocx} className="gap-2 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateDocx} disabled={isGenerating || isGeneratingDocx} className="gap-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word (.docx)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <SettingsMenu />
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
                  {t.tabText}
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  {t.tabMetadata}
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                  <SplitSquareHorizontal className="w-3.5 h-3.5 mr-1.5 rotate-45" aria-hidden="true" />
                  {t.tabSettings}
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
                    {t.chaptersDetected(chapters.length)}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">{t.totalWords(wordCount.toLocaleString())}</span>
                </div>
                <ol className="divide-y divide-border/60">
                  {chapters.map((ch, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30 transition-colors">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground tabular-nums w-8">#{ch.number}</span>
                        <span className="text-foreground truncate max-w-[200px]">{ch.title || <span className="text-muted-foreground italic">{t.noChapterTitle}</span>}</span>
                        {ch.notes && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t.notes}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0 ml-4">
                        {countWords(ch.content).toLocaleString()} {t.wordsAbbr}
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
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.statsTitle}</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t.statWords}</p>
                    <p className="text-2xl font-heading font-semibold tabular-nums leading-none">{wordCount.toLocaleString()}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t.statChapters}</p>
                    <p className="text-2xl font-heading font-semibold tabular-nums leading-none">{chapters.length}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t.statReadingTime}</p>
                    {(() => {
                      const mins = Math.ceil(wordCount / 200);
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      return (
                        <>
                          <p className="text-2xl font-heading font-semibold tabular-nums leading-none">
                            {h > 0 ? `${h}h ${m}m` : `${m}m`}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.statReadingRate}</p>
                        </>
                      );
                    })()}
                  </div>
                  {chapters.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t.statAvgPerChapter}</p>
                        <p className="text-lg font-heading font-semibold tabular-nums leading-none">
                          {Math.round(wordCount / chapters.length).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.statWordsUnit}</p>
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
                    {t.previewTitle}
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


      </div>

      {/* Review panel */}
      {showReview && chapters.length > 0 && (
        <ReviewPanel
          chapters={chapters}
          rawText={text}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* Kanban board */}
      {showKanban && (
        <KanbanBoard
          onLoad={handleLoadProject}
          onClose={() => setShowKanban(false)}
        />
      )}

      {/* PWA install banner */}
      <InstallPWA />

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