export default {
  // Header
  appName: "Novelista",
  chaptersCount: (n) => `${n} ch.`,
  words: (n) => `${n} words`,
  history: "History",
  review: "Review",
  hidePreview: "Hide",
  showPreview: "Preview",
  generatingWord: "Generating…",
  generatingPdf: "Generating…",

  // Tabs
  tabText: "Text",
  tabMetadata: "Metadata",
  tabSettings: "Settings",

  // Projects panel
  projects: "Projects",
  saveProject: "Save",
  savingProject: "Saving…",
  newProject: "New project",
  newCollection: "New collection",
  selectToExport: "Select to export",
  cancelSelection: "Cancel selection",
  cancelBtn: "Cancel",
  noProjectsYet: "Save your first project to see it here.",
  noCollection: "No collection",
  emptyCollection: "Empty",
  exportSelected: "Export selected",
  selectedCount: (n) => `${n} selected`,
  tapToSelect: "Tap a project to select",
  deleteProject: (t) => `Delete "${t}"`,
  deleteCollection: (n) => `Delete collection "${n}"`,
  moveToCollection: "Move to collection",
  withoutTitle: "Untitled",
  collectionName: "Collection name",
  create: "Create",

  // Stats sidebar
  statsTitle: "Statistics",
  statWords: "Words",
  statChapters: "Chapters",
  statReadingTime: "Est. reading",
  statAvgPerChapter: "Avg / chapter",
  statWordsUnit: "words",
  statReadingRate: "at 200 wpm",

  // Chapter list
  chaptersDetected: (n) => `${n} ${n === 1 ? "chapter detected" : "chapters detected"}`,
  totalWords: (n) => `${n} words total`,
  wordsAbbr: "w.",
  notes: "notes",
  noChapterTitle: "Untitled",

  // Quick notes
  quickNotesTitle: "Quick notes",
  quickNotesPlaceholder: "Plot ideas, pending changes, reminders… Write freely.",
  quickNotesSaved: "Saved",
  quickNotesAutosave: "Saves automatically",

  // Preview
  previewTitle: "Book preview",

  // Empty state
  emptyStateTitle: "Format your novel for print",
  emptyStateDesc: "Paste the text, fill in the metadata and download a professionally typeset PDF or Word file.",
  step1Label: "Paste the text",
  step1Desc: "From any source",
  step2Label: "Adjust the details",
  step2Desc: "Title, author, format",
  step3Label: "Download",
  step3Desc: "Print-ready PDF or Word",
  stepPrefix: "Step",

  // Toast messages
  toastEmptyProject: "Empty project",
  toastEmptyProjectDesc: "Add at least a title or some text.",
  toastNoText: "No text",
  toastNoTextDesc: "Paste your novel's text first.",
  toastNoTitle: "No title",
  toastNoTitleDesc: "Enter at least the book title.",
  toastSaved: "Project saved",
  toastLoaded: (t) => `"${t}" loaded`,
  toastDone: "Done!",
  toastPdfDesc: "Your book is downloading.",
  toastWordDesc: "Your Word file is downloading.",
  toastErrorPdf: "Error generating PDF",
  toastErrorWord: "Error generating Word",
  toastErrorSave: "Error saving",
  toastRetry: "Please try again.",
  toastVersionRestored: "Version restored",
  toastVersionRestoredDesc: (t) => `Restored from ${t}`,
  toastHistoryImported: "History imported",
  toastHistoryImportedDesc: (n) => `${n} versions loaded.`,
  toastHistoryImportError: "Import error",
  toastHistoryImportErrorDesc: "The file is not valid.",

  // Accessibility
  skipToMain: "Skip to main content",
  a11yToolbar: "Accessibility controls",
  a11yReduceText: "Decrease text size",
  a11yIncreaseText: "Increase text size",
  a11yTextSize: (pct) => `Text size: ${pct}%`,
  a11yLight: "Light mode",
  a11yDark: "Dark mode",
  a11ySystem: "Use system preference",

  // Templates panel
  templatesTitle: "Format templates",
  templatesSaveBtn: "Save current settings as template",
  templatesNamePlaceholder: "Template name",
  templatesEmpty: "You have no saved templates yet.",
  templatesApply: "Apply",
  templatesSaved: "Template saved",
  templatesSavedDesc: (n) => `"${n}" ready to use.`,
  templatesApplied: (n) => `Template "${n}" applied`,
  templatesDeleted: (n) => `Template "${n}" deleted`,
  templatesErrorSave: "Error saving",
  templatesDeleteLabel: (n) => `Delete template "${n}"`,

  searchProjects: "Search by title or author…",
  noSearchResults: "No results for that search.",

  // Kanban
  kanbanTitle: "Projects board",
  kanbanClose: "Close board",
  kanbanBtn: "Board",
  kanbanDraft: "Draft",
  kanbanEditing: "Editing",
  kanbanFormatting: "Formatting",
  kanbanReady: "Ready",
  kanbanEmpty: "No projects",

  // Language selector
  language: "Language",
};