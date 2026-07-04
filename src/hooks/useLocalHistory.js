import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "novelista_history";
const MAX_VERSIONS = 10;
const DEBOUNCE_MS = 1000;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // quota exceeded — drop oldest
    const trimmed = history.slice(-5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

/**
 * Auto-saves a snapshot of {text, metadata, settings} to localStorage
 * after DEBOUNCE_MS of inactivity. Keeps up to MAX_VERSIONS entries.
 */
export function useLocalHistory(text, metadata, settings) {
  const [history, setHistory] = useState(() => loadHistory());
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const timerRef = useRef(null);
  const prevRef = useRef(null);

  const saveSnapshot = useCallback(() => {
    const snapshot = { text, metadata, settings };
    const snapshotStr = JSON.stringify(snapshot);

    // Skip if identical to last saved
    if (prevRef.current === snapshotStr) return;
    prevRef.current = snapshotStr;

    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      title: metadata.title || "Sin título",
      wordCount: (text || "").split(/\s+/).filter(Boolean).length,
      snapshot,
    };

    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_VERSIONS);
      saveHistory(next);
      return next;
    });
    setLastSavedAt(new Date());
  }, [text, metadata, settings]);

  // Debounced auto-save on any change
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveSnapshot, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [saveSnapshot]);

  const deleteVersion = useCallback((id) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    prevRef.current = null;
  }, []);

  const exportHistory = useCallback(() => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novelista_historial_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const importHistory = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) throw new Error("Formato inválido");
          const merged = [...imported, ...history]
            .sort((a, b) => b.id - a.id)
            .slice(0, MAX_VERSIONS);
          setHistory(merged);
          saveHistory(merged);
          resolve(merged.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }, [history]);

  return { history, lastSavedAt, deleteVersion, clearHistory, exportHistory, importHistory };
}