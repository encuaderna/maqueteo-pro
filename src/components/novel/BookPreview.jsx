import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCENE_SEPARATORS } from "@/lib/formatting-utils";

function loadGoogleFont(fontName) {
  if (!fontName) return;
  const id = `gfont-preview-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

function PageShell({ settings, pageNumber, isRight, headerLeft, headerRight, showHeader, children }) {
  const bg = settings.paperColor === "cream" ? "#FDF5E6" : "#FFFFFF";
  const fontSize = settings.fontSize;
  const lineHeight = settings.lineSpacing;
  const bodyFont = settings.typography?.body || 'EB Garamond';

  return (
    <div
      className="relative border border-border/60 shadow-sm flex-shrink-0 overflow-hidden"
      style={{
        width: 280,
        height: 380,
        backgroundColor: bg,
        fontFamily: `'${bodyFont}', 'Garamond', 'Georgia', serif`,
        fontSize: `${(fontSize / 11) * 9}px`,
      }}
    >
      {/* Running header */}
      {showHeader && (
        <div
          className="absolute top-0 left-0 right-0 px-6 pt-3 text-center"
          style={{ fontSize: "6px", letterSpacing: "0.1em", color: "#999", fontVariant: "small-caps" }}
        >
          {isRight ? headerRight : headerLeft}
        </div>
      )}

      {/* Content area */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: showHeader ? 24 : 16,
          bottom: 24,
          left: `${settings.margins.sides * 24}px`,
          right: `${settings.margins.sides * 24}px`,
          lineHeight: lineHeight,
        }}
      >
        {children}
      </div>

      {/* Page number */}
      {pageNumber > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 pb-2 text-center"
          style={{ fontSize: "7px", color: "#999" }}
        >
          {pageNumber}
        </div>
      )}
    </div>
  );
}

function renderParagraphs(text, settings, isChapterStart) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  return paragraphs.map((para, i) => {
    const trimmed = para.trim();

    // Scene separator detection
    if (trimmed === "***" || trimmed === "---" || trimmed === "* * *" || trimmed === "—") {
      const sep = settings.sceneSeparator;
      return (
        <div key={i} className="flex justify-center py-2">
          {sep === "custom" && settings.customSeparatorUrl ? (
            <img src={settings.customSeparatorUrl} alt="" style={{ maxHeight: 16, maxWidth: 48 }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: SCENE_SEPARATORS[sep] || SCENE_SEPARATORS.fleuron }} />
          )}
        </div>
      );
    }

    const showDropCap = settings.showDropCap && isChapterStart && i === 0;
    const dc = settings.dropCap || {};
    const dcFont = dc.font || 'Garamond';
    const dcMult = dc.sizeMultiplier || 3;
    const dcLines = dc.linesHigh || 2;
    // Approximate line height in em for the drop cap height
    const dcLineHeight = (settings.lineSpacing || 1.5);
    const dcFontSize = `${dcMult}em`;
    const dcFloatHeight = `${dcLines * dcLineHeight}em`;

    return (
      <p
        key={i}
        style={{
          textIndent: i === 0 && isChapterStart ? 0 : `${settings.indent * 20}px`,
          textAlign: "justify",
          margin: 0,
          padding: 0,
        }}
      >
        {showDropCap && trimmed.length > 1 ? (
          <>
            <span
              style={{
                float: "left",
                fontSize: dcFontSize,
                lineHeight: 1,
                height: dcFloatHeight,
                paddingRight: "3px",
                paddingTop: "1px",
                fontFamily: `'${dcFont}', serif`,
                fontWeight: 500,
                color: "#222",
              }}
            >
              {trimmed[0]}
            </span>
            {trimmed.slice(1)}
          </>
        ) : (
          trimmed
        )}
      </p>
    );
  });
}

export default function BookPreview({ chapters, metadata, settings }) {
  const [currentSpread, setCurrentSpread] = useState(0);

  // Load selected fonts whenever they change
  useEffect(() => {
    const fonts = settings.typography || {};
    [fonts.body, fonts.chapter, fonts.title].filter(Boolean).forEach(loadGoogleFont);
  }, [settings.typography]);

  const titleFont = settings.typography?.title || 'EB Garamond';
  const chapterFont = settings.typography?.chapter || 'EB Garamond';

  // Build all preview pages
  const pages = [];

  // 1. Courtesy page (blank)
  pages.push({ type: "courtesy", content: null });

  // 2. Half title
  pages.push({
    type: "halftitle",
    content: (
      <div className="h-full flex items-center justify-center">
        <h1 style={{ fontSize: "1.4em", fontWeight: 400, textAlign: "center", letterSpacing: "0.05em", fontFamily: `'${titleFont}', serif` }}>
          {metadata.title || "Sin título"}
        </h1>
      </div>
    ),
  });

  // 3. Blank verso
  pages.push({ type: "courtesy", content: null });

  // 4. Full title page
  pages.push({
    type: "title",
    content: (
      <div className="h-full flex flex-col items-center justify-center text-center gap-3">
        <h1 style={{ fontSize: "1.6em", fontWeight: 400, letterSpacing: "0.08em", lineHeight: 1.3, fontFamily: `'${titleFont}', serif` }}>
          {metadata.title || "Sin título"}
        </h1>
        <div style={{ width: 40, height: 1, backgroundColor: "#ccc" }} />
        <p style={{ fontSize: "0.85em", letterSpacing: "0.1em", fontVariant: "small-caps", color: "#666" }}>
          {metadata.author || "Autor desconocido"}
        </p>
        {metadata.year && (
          <p style={{ fontSize: "0.7em", color: "#999", marginTop: 4 }}>{metadata.year}</p>
        )}
      </div>
    ),
  });

  // 5. Interior title with metadata
  if (settings.showMetadata && (metadata.fandom || metadata.pairings || metadata.summary || metadata.original_link)) {
    // Blank verso before interior title
    pages.push({ type: "courtesy", content: null });
    pages.push({
      type: "interior",
      content: (
        <div className="h-full flex flex-col justify-center gap-2" style={{ fontSize: "0.75em" }}>
          {metadata.fandom && (
            <div>
              <span style={{ fontVariant: "small-caps", color: "#999", fontSize: "0.85em" }}>Fandom</span>
              <p style={{ margin: "2px 0 6px" }}>{metadata.fandom}</p>
            </div>
          )}
          {metadata.pairings && (
            <div>
              <span style={{ fontVariant: "small-caps", color: "#999", fontSize: "0.85em" }}>Parejas</span>
              <p style={{ margin: "2px 0 6px" }}>{metadata.pairings}</p>
            </div>
          )}
          {metadata.summary && (
            <div>
              <span style={{ fontVariant: "small-caps", color: "#999", fontSize: "0.85em" }}>Resumen</span>
              <p style={{ margin: "2px 0 6px", fontStyle: "italic", lineHeight: 1.5 }}>{metadata.summary}</p>
            </div>
          )}
          {metadata.original_link && (
            <div>
              <span style={{ fontVariant: "small-caps", color: "#999", fontSize: "0.85em" }}>Publicación original</span>
              <p style={{ margin: "2px 0", fontSize: "0.85em", color: "#666", wordBreak: "break-all" }}>
                {metadata.original_link}
              </p>
            </div>
          )}
        </div>
      ),
    });
  }

  // 6. Table of Contents
  if (settings.showToc && chapters.length > 1) {
    // Ensure TOC starts on odd page
    if (pages.length % 2 === 0) pages.push({ type: "courtesy", content: null });
    pages.push({
      type: "toc",
      content: (
        <div className="h-full flex flex-col pt-8">
          <h2
            style={{
              fontSize: "0.9em",
              fontVariant: "small-caps",
              letterSpacing: "0.15em",
              textAlign: "center",
              marginBottom: 16,
              color: "#666",
            }}
          >
            Índice
          </h2>
          <div className="space-y-1">
            {chapters.map((ch, i) => (
              <div key={i} className="flex items-baseline gap-1" style={{ fontSize: "0.8em" }}>
                <span>Capítulo {ch.number}</span>
                {ch.title && (
                  <>
                    <span className="flex-1 border-b border-dotted border-gray-300 mx-1" style={{ marginBottom: 3 }} />
                    <span style={{ color: "#666" }}>{ch.title}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  // 7. Chapter pages
  chapters.forEach((chapter) => {
    // Chapters start on odd (right) page
    if (pages.length % 2 === 0) pages.push({ type: "courtesy", content: null });

    // Chapter opening page
    pages.push({
      type: "chapter-start",
      content: (
        <div className="h-full flex flex-col pt-12">
          <div className="text-center mb-4">
            <p style={{ fontSize: "0.7em", letterSpacing: "0.2em", fontVariant: "small-caps", color: "#999", fontFamily: `'${chapterFont}', serif` }}>
              Capítulo {chapter.number}
            </p>
            {chapter.title && (
              <h2 style={{ fontSize: "1.1em", fontWeight: 400, marginTop: 4, letterSpacing: "0.03em", fontFamily: `'${chapterFont}', serif` }}>
                {chapter.title}
              </h2>
            )}
          </div>
          <div style={{ width: 30, height: 1, backgroundColor: "#ddd", margin: "0 auto 12px" }} />
          <div className="flex-1 overflow-hidden">
            {renderParagraphs(chapter.content?.slice(0, 500), settings, true)}
          </div>
        </div>
      ),
    });

    // Additional content pages (simplified for preview)
    const contentLength = chapter.content?.length || 0;
    const pagesNeeded = Math.max(0, Math.ceil(contentLength / 800) - 1);
    for (let p = 0; p < Math.min(pagesNeeded, 3); p++) {
      const start = 500 + p * 800;
      const slice = chapter.content?.slice(start, start + 800) || "";
      if (!slice.trim()) break;
      pages.push({
        type: "body",
        showHeader: true,
        content: (
          <div className="h-full overflow-hidden pt-2">
            {renderParagraphs(slice, settings, false)}
          </div>
        ),
      });
    }

    // Author notes
    if (chapter.notes) {
      pages.push({
        type: "body",
        showHeader: true,
        content: (
          <div className="h-full flex flex-col justify-end pb-4">
            {settings.authorNotesStyle === "A" ? (
              <div className="text-center" style={{ padding: "0 12px" }}>
                <div style={{ borderTop: "1px dotted #ccc", margin: "8px 0" }} />
                <p style={{ fontSize: "0.7em", fontStyle: "italic", lineHeight: 1.6, color: "#666" }}>
                  {chapter.notes.slice(0, 200)}
                </p>
                <div style={{ borderBottom: "1px dotted #ccc", margin: "8px 0" }} />
              </div>
            ) : (
              <div style={{ backgroundColor: "rgba(0,0,0,0.04)", padding: 8, borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                <p style={{ fontSize: "0.65em", fontWeight: 600, fontFamily: "sans-serif", marginBottom: 4 }}>
                  Nota del autor:
                </p>
                <p style={{ fontSize: "0.7em", lineHeight: 1.5, textAlign: "justify" }}>
                  {chapter.notes.slice(0, 200)}
                </p>
              </div>
            )}
          </div>
        ),
      });
    }
  });

  // 8. Final courtesy page
  if (pages.length % 2 !== 0) pages.push({ type: "courtesy", content: null });
  pages.push({ type: "courtesy", content: null });

  const totalSpreads = Math.ceil(pages.length / 2);
  const leftPage = pages[currentSpread * 2];
  const rightPage = pages[currentSpread * 2 + 1];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Book spread */}
      <div className="flex gap-0.5">
        <PageShell
          settings={settings}
          pageNumber={currentSpread * 2}
          isRight={false}
          headerLeft={metadata.author?.toUpperCase() || ""}
          headerRight={metadata.title?.toUpperCase() || ""}
          showHeader={leftPage?.showHeader || leftPage?.type === "body"}
        >
          {leftPage?.content}
        </PageShell>
        <PageShell
          settings={settings}
          pageNumber={currentSpread * 2 + 1}
          isRight={true}
          headerLeft={metadata.author?.toUpperCase() || ""}
          headerRight={metadata.title?.toUpperCase() || ""}
          showHeader={rightPage?.showHeader || rightPage?.type === "body"}
        >
          {rightPage?.content}
        </PageShell>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentSpread(Math.max(0, currentSpread - 1))}
          disabled={currentSpread === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentSpread + 1} / {totalSpreads}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentSpread(Math.min(totalSpreads - 1, currentSpread + 1))}
          disabled={currentSpread >= totalSpreads - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}