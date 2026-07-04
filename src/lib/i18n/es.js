export default {
  // Header
  appName: "Novelista",
  chaptersCount: (n) => `${n} cap.`,
  words: (n) => `${n} palabras`,
  history: "Historial",
  review: "Revisar",
  hidePreview: "Ocultar",
  showPreview: "Previsualizar",
  generatingWord: "Generando…",
  generatingPdf: "Generando…",

  // Tabs
  tabText: "Texto",
  tabMetadata: "Detalles",
  tabSettings: "Formato",

  // Projects panel
  projects: "Proyectos",
  saveProject: "Guardar",
  savingProject: "Guardando…",
  newProject: "Nuevo proyecto",
  newCollection: "Nueva colección",
  selectToExport: "Seleccionar para exportar",
  cancelSelection: "Cancelar selección",
  cancelBtn: "Cancelar",
  noProjectsYet: "Guarda tu primer proyecto para verlo aquí.",
  noCollection: "Sin colección",
  emptyCollection: "Vacía",
  exportSelected: "Exportar seleccionados",
  selectedCount: (n) => `${n} seleccionado${n > 1 ? "s" : ""}`,
  tapToSelect: "Toca un proyecto para seleccionar",
  deleteProject: (t) => `Eliminar "${t}"`,
  deleteCollection: (n) => `Eliminar colección "${n}"`,
  moveToCollection: "Mover a colección",
  withoutTitle: "Sin título",
  collectionName: "Nombre de la colección",
  create: "Crear",

  // Stats sidebar
  statsTitle: "Estadísticas",
  statWords: "Palabras",
  statChapters: "Capítulos",
  statReadingTime: "Tiempo de lectura",
  statAvgPerChapter: "Promedio / cap.",
  statWordsUnit: "palabras",
  statReadingRate: "a 200 pal/min",

  // Chapter list
  chaptersDetected: (n) => `${n} ${n === 1 ? "capítulo detectado" : "capítulos detectados"}`,
  totalWords: (n) => `${n} palabras en total`,
  wordsAbbr: "pal.",
  notes: "notas",
  noChapterTitle: "Sin título",

  // Quick notes
  quickNotesTitle: "Notas rápidas",
  quickNotesPlaceholder: "Ideas de trama, cambios pendientes, recordatorios… Escribe libremente.",
  quickNotesSaved: "Guardado",
  quickNotesAutosave: "Se guarda automáticamente",

  // Preview
  previewTitle: "Vista previa del libro",

  // Empty state
  emptyStateTitle: "Formatea tu novela para impresión",
  emptyStateDesc: "Pega el texto, completa los metadatos y descarga un PDF o Word con tipografía profesional.",
  step1Label: "Pega el texto",
  step1Desc: "Desde cualquier fuente",
  step2Label: "Ajusta los detalles",
  step2Desc: "Título, autor, formato",
  step3Label: "Descarga",
  step3Desc: "PDF o Word listo para imprimir",
  stepPrefix: "Paso",

  // Toast messages
  toastEmptyProject: "Proyecto vacío",
  toastEmptyProjectDesc: "Agrega al menos un título o texto.",
  toastNoText: "Sin texto",
  toastNoTextDesc: "Pega el texto de tu novela primero.",
  toastNoTitle: "Sin título",
  toastNoTitleDesc: "Ingresa al menos el título del libro.",
  toastSaved: "Proyecto guardado",
  toastLoaded: (t) => `"${t}" cargado`,
  toastDone: "¡Listo!",
  toastPdfDesc: "Tu libro se está descargando.",
  toastWordDesc: "Tu libro Word se está descargando.",
  toastErrorPdf: "Error al generar PDF",
  toastErrorWord: "Error al generar Word",
  toastErrorSave: "Error al guardar",
  toastRetry: "Intenta de nuevo.",
  toastVersionRestored: "Versión restaurada",
  toastVersionRestoredDesc: (t) => `Restaurado desde ${t}`,
  toastHistoryImported: "Historial importado",
  toastHistoryImportedDesc: (n) => `${n} versiones cargadas.`,
  toastHistoryImportError: "Error al importar",
  toastHistoryImportErrorDesc: "El archivo no es válido.",

  // Accessibility
  skipToMain: "Saltar al contenido principal",
  a11yToolbar: "Controles de accesibilidad",
  a11yReduceText: "Reducir tamaño del texto",
  a11yIncreaseText: "Aumentar tamaño del texto",
  a11yTextSize: (pct) => `Tamaño de texto: ${pct}%`,
  a11yLight: "Modo claro",
  a11yDark: "Modo oscuro",
  a11ySystem: "Usar preferencia del sistema",

  // Templates panel
  templatesTitle: "Plantillas de formato",
  templatesSaveBtn: "Guardar configuración actual como plantilla",
  templatesNamePlaceholder: "Nombre de la plantilla",
  templatesEmpty: "Aún no tienes plantillas guardadas.",
  templatesApply: "Aplicar",
  templatesSaved: "Plantilla guardada",
  templatesSavedDesc: (n) => `"${n}" lista para usar.`,
  templatesApplied: (n) => `Plantilla "${n}" aplicada`,
  templatesDeleted: (n) => `Plantilla "${n}" eliminada`,
  templatesErrorSave: "Error al guardar",
  templatesDeleteLabel: (n) => `Eliminar plantilla "${n}"`,

  searchProjects: "Buscar por título o autor…",
  noSearchResults: "Sin resultados para esa búsqueda.",

  // Kanban
  kanbanTitle: "Tablero de proyectos",
  kanbanClose: "Cerrar tablero",
  kanbanBtn: "Tablero",
  kanbanDraft: "Borrador",
  kanbanEditing: "En edición",
  kanbanFormatting: "Formateando",
  kanbanReady: "Listo",
  kanbanEmpty: "Sin proyectos",

  // Language selector
  language: "Idioma",
};