export default {
  // Header
  appName: "Novelista",
  chaptersCount: (n) => `${n} cap.`,
  words: (n) => `${n} palavras`,
  history: "Histórico",
  review: "Revisar",
  hidePreview: "Ocultar",
  showPreview: "Visualizar",
  generatingWord: "Gerando…",
  generatingPdf: "Gerando…",

  // Tabs
  tabText: "Texto",
  tabMetadata: "Metadados",
  tabSettings: "Configurações",

  // Projects panel
  projects: "Projetos",
  saveProject: "Salvar",
  savingProject: "Salvando…",
  newProject: "Novo projeto",
  newCollection: "Nova coleção",
  selectToExport: "Selecionar para exportar",
  cancelSelection: "Cancelar seleção",
  cancelBtn: "Cancelar",
  noProjectsYet: "Salve seu primeiro projeto para vê-lo aqui.",
  noCollection: "Sem coleção",
  emptyCollection: "Vazia",
  exportSelected: "Exportar selecionados",
  selectedCount: (n) => `${n} selecionado${n > 1 ? "s" : ""}`,
  tapToSelect: "Toque em um projeto para selecionar",
  deleteProject: (t) => `Excluir "${t}"`,
  deleteCollection: (n) => `Excluir coleção "${n}"`,
  moveToCollection: "Mover para coleção",
  withoutTitle: "Sem título",
  collectionName: "Nome da coleção",
  create: "Criar",

  // Stats sidebar
  statsTitle: "Estatísticas",
  statWords: "Palavras",
  statChapters: "Capítulos",
  statReadingTime: "Leitura est.",
  statAvgPerChapter: "Média / cap.",
  statWordsUnit: "palavras",
  statReadingRate: "a 200 pal/min",

  // Chapter list
  chaptersDetected: (n) => `${n} ${n === 1 ? "capítulo detectado" : "capítulos detectados"}`,
  totalWords: (n) => `${n} palavras no total`,
  wordsAbbr: "pal.",
  notes: "notas",
  noChapterTitle: "Sem título",

  // Quick notes
  quickNotesTitle: "Notas rápidas",
  quickNotesPlaceholder: "Ideias de enredo, mudanças pendentes, lembretes… Escreva livremente.",
  quickNotesSaved: "Salvo",
  quickNotesAutosave: "Salva automaticamente",

  // Preview
  previewTitle: "Prévia do livro",

  // Empty state
  emptyStateTitle: "Formate seu romance para impressão",
  emptyStateDesc: "Cole o texto, preencha os metadados e baixe um PDF ou Word com tipografia profissional.",
  step1Label: "Cole o texto",
  step1Desc: "De qualquer fonte",
  step2Label: "Ajuste os detalhes",
  step2Desc: "Título, autor, formato",
  step3Label: "Baixar",
  step3Desc: "PDF ou Word pronto para imprimir",
  stepPrefix: "Passo",

  // Toast messages
  toastEmptyProject: "Projeto vazio",
  toastEmptyProjectDesc: "Adicione pelo menos um título ou texto.",
  toastNoText: "Sem texto",
  toastNoTextDesc: "Cole o texto do seu romance primeiro.",
  toastNoTitle: "Sem título",
  toastNoTitleDesc: "Insira pelo menos o título do livro.",
  toastSaved: "Projeto salvo",
  toastLoaded: (t) => `"${t}" carregado`,
  toastDone: "Pronto!",
  toastPdfDesc: "Seu livro está sendo baixado.",
  toastWordDesc: "Seu arquivo Word está sendo baixado.",
  toastErrorPdf: "Erro ao gerar PDF",
  toastErrorWord: "Erro ao gerar Word",
  toastErrorSave: "Erro ao salvar",
  toastRetry: "Tente novamente.",
  toastVersionRestored: "Versão restaurada",
  toastVersionRestoredDesc: (t) => `Restaurado de ${t}`,
  toastHistoryImported: "Histórico importado",
  toastHistoryImportedDesc: (n) => `${n} versões carregadas.`,
  toastHistoryImportError: "Erro ao importar",
  toastHistoryImportErrorDesc: "O arquivo não é válido.",

  // Accessibility
  skipToMain: "Pular para o conteúdo principal",
  a11yToolbar: "Controles de acessibilidade",
  a11yReduceText: "Reduzir tamanho do texto",
  a11yIncreaseText: "Aumentar tamanho do texto",
  a11yTextSize: (pct) => `Tamanho do texto: ${pct}%`,
  a11yLight: "Modo claro",
  a11yDark: "Modo escuro",
  a11ySystem: "Usar preferência do sistema",

  // Templates panel
  templatesTitle: "Modelos de formato",
  templatesSaveBtn: "Salvar configurações atuais como modelo",
  templatesNamePlaceholder: "Nome do modelo",
  templatesEmpty: "Você ainda não tem modelos salvos.",
  templatesApply: "Aplicar",
  templatesSaved: "Modelo salvo",
  templatesSavedDesc: (n) => `"${n}" pronto para usar.`,
  templatesApplied: (n) => `Modelo "${n}" aplicado`,
  templatesDeleted: (n) => `Modelo "${n}" excluído`,
  templatesErrorSave: "Erro ao salvar",
  templatesDeleteLabel: (n) => `Excluir modelo "${n}"`,

  // Language selector
  language: "Idioma",
};