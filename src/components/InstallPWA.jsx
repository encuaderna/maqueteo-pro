import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      setPrompt(null);
    }
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border shadow-lg rounded-xl px-4 py-3 max-w-sm w-[calc(100%-2rem)]">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">Instalar Novelista</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Accede offline desde tu dispositivo</p>
      </div>
      <Button size="sm" className="text-xs h-8 gap-1.5 flex-shrink-0" onClick={handleInstall}>
        <Download className="w-3.5 h-3.5" />
        Instalar
      </Button>
      <button
        onClick={() => setShow(false)}
        className="text-muted-foreground hover:text-foreground flex-shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}