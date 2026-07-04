import { useEffect } from "react";

/**
 * useKeyboardShortcuts
 * Registers global keyboard shortcuts for common app actions.
 *
 * Shortcuts:
 *  Ctrl/Cmd + S       → save
 *  Ctrl/Cmd + P       → toggle preview
 *  Ctrl/Cmd + 1/2/3   → switch tab (text / metadata / settings)
 *  Ctrl/Cmd + ←/→     → previous / next chapter in review
 */
export function useKeyboardShortcuts({ onSave, onTogglePreview, onSwitchTab, onPrevChapter, onNextChapter }) {
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      // Don't intercept when user is typing in an input / textarea
      const tag = document.activeElement?.tagName;
      const isEditing = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;

      switch (e.key) {
        case "s":
          e.preventDefault();
          onSave?.();
          break;

        case "p":
          if (!isEditing) {
            e.preventDefault();
            onTogglePreview?.();
          }
          break;

        case "1":
          e.preventDefault();
          onSwitchTab?.("text");
          break;

        case "2":
          e.preventDefault();
          onSwitchTab?.("metadata");
          break;

        case "3":
          e.preventDefault();
          onSwitchTab?.("settings");
          break;

        case "ArrowLeft":
          if (!isEditing) {
            e.preventDefault();
            onPrevChapter?.();
          }
          break;

        case "ArrowRight":
          if (!isEditing) {
            e.preventDefault();
            onNextChapter?.();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onTogglePreview, onSwitchTab, onPrevChapter, onNextChapter]);
}