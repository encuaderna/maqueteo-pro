import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu, X, History, SplitSquareHorizontal, Eye, EyeOff, Download, FileText, Loader2
} from "lucide-react";

export default function MobileMenu({
  showPreview, onTogglePreview, textExists,
  showHistory, onToggleHistory, historyCount,
  onShowKanban, onShowReview,
  isGenerating, isGeneratingDocx,
  onGeneratePdf, onGenerateDocx,
}) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(v => !v)}
        aria-label="Menú"
        aria-expanded={open}
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={close}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-popover shadow-lg py-1">
            {/* History */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
              onClick={() => { onToggleHistory(); close(); }}
            >
              <History className="w-4 h-4 text-muted-foreground" />
              <span>Historial</span>
              {historyCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] rounded-full px-1.5 py-0.5 leading-none">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Kanban */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
              onClick={() => { onShowKanban(); close(); }}
            >
              <SplitSquareHorizontal className="w-4 h-4 text-muted-foreground rotate-90" />
              <span>Tablero</span>
            </button>

            {/* Review */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40"
              onClick={() => { onShowReview(); close(); }}
              disabled={!textExists}
            >
              <SplitSquareHorizontal className="w-4 h-4 text-muted-foreground" />
              <span>Revisar</span>
            </button>

            <div className="my-1 h-px bg-border" />

            {/* Preview toggle */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40"
              onClick={() => { onTogglePreview(); close(); }}
              disabled={!textExists}
            >
              {showPreview ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              <span>{showPreview ? "Ocultar vista previa" : "Vista previa"}</span>
            </button>

            <div className="my-1 h-px bg-border" />

            {/* Export PDF */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40"
              onClick={() => { onGeneratePdf(); close(); }}
              disabled={isGenerating || isGeneratingDocx || !textExists}
            >
              {isGenerating
                ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                : <Download className="w-4 h-4 text-muted-foreground" />}
              <span>Exportar PDF</span>
            </button>

            {/* Export Word */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors disabled:opacity-40"
              onClick={() => { onGenerateDocx(); close(); }}
              disabled={isGenerating || isGeneratingDocx || !textExists}
            >
              {isGeneratingDocx
                ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                : <FileText className="w-4 h-4 text-muted-foreground" />}
              <span>Exportar Word</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}