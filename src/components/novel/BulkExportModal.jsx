import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function BulkExportModal({ projects, onClose }) {
  const { toast } = useToast();
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("exportProjectsZip", {
        projectIds: projects.map(p => p.id),
        format,
      });

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proyectos-${format}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "¡Descarga lista!", description: `${projects.length} archivo${projects.length > 1 ? "s" : ""} en el ZIP.` });
      onClose();
    } catch (err) {
      toast({ title: "Error al exportar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Exportar {projects.length} proyecto{projects.length > 1 ? "s" : ""}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project list */}
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {projects.map(p => (
            <li key={p.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{p.title || "Sin título"}</span>
              {p.author && <span className="text-muted-foreground/60">— {p.author}</span>}
            </li>
          ))}
        </ul>

        {/* Format selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato de exportación</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "pdf", label: "PDF", desc: "Para lectura" },
              { value: "docx", label: "Word", desc: "Para edición" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFormat(opt.value)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  format === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2" onClick={handleExport} disabled={loading} aria-busy={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generando ZIP…</>
          ) : (
            <><Download className="w-4 h-4" /> Descargar ZIP</>
          )}
        </Button>
      </div>
    </div>
  );
}