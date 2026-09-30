import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "pt" | "es" | "fr";

interface LocaleStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist((set) => ({ locale: "en", setLocale: (l) => set({ locale: l }) }), { name: "locale-storage" })
);

const dict = {
  appName: { en: "Buildmy CV", pt: "Buildmy CV", es: "Buildmy CV", fr: "Buildmy CV" },
  tagline: {
    en: "everything stays in your browser",
    pt: "tudo fica no seu navegador",
    es: "todo se queda en tu navegador",
    fr: "tout reste dans votre navigateur",
  },
  tabCV: { en: "CV", pt: "CV", es: "CV", fr: "CV" },
  tabCoverLetter: {
    en: "Cover letter",
    pt: "Carta de apresentação",
    es: "Carta de presentación",
    fr: "Lettre de motivation",
  },

  rename: { en: "Rename", pt: "Renomear", es: "Renombrar", fr: "Renommer" },
  newProfile: { en: "+ New", pt: "+ Novo", es: "+ Nuevo", fr: "+ Nouveau" },
  duplicate: { en: "Duplicate", pt: "Duplicar", es: "Duplicar", fr: "Dupliquer" },
  deleteProfile: { en: "Delete", pt: "Eliminar", es: "Eliminar", fr: "Supprimer" },
  importFromFile: { en: "Import from file", pt: "Importar de ficheiro", es: "Importar de archivo", fr: "Importer un fichier" },
  exportAllZip: { en: "Export all as ZIP", pt: "Exportar tudo em ZIP", es: "Exportar todo en ZIP", fr: "Exporter tout en ZIP" },

  downloadPDF: { en: "Download PDF", pt: "Transferir PDF", es: "Descargar PDF", fr: "Télécharger le PDF" },
  downloadWord: { en: "Download Word", pt: "Transferir Word", es: "Descargar Word", fr: "Télécharger le Word" },
  generating: { en: "Generating…", pt: "A gerar…", es: "Generando…", fr: "Génération…" },
  print: { en: "Print", pt: "Imprimir", es: "Imprimir", fr: "Imprimer" },
  shareLink: { en: "Share link", pt: "Partilhar link", es: "Compartir enlace", fr: "Partager le lien" },
  linkCopied: { en: "Link copied!", pt: "Link copiado!", es: "¡Enlace copiado!", fr: "Lien copié !" },
  email: { en: "Email", pt: "E-mail", es: "Correo", fr: "E-mail" },
  copyAsText: { en: "Copy as text", pt: "Copiar como texto", es: "Copiar como texto", fr: "Copier en texte" },
  textCopied: { en: "Copied!", pt: "Copiado!", es: "¡Copiado!", fr: "Copié !" },
  saveData: { en: "Save data", pt: "Guardar dados", es: "Guardar datos", fr: "Enregistrer les données" },
  loadData: { en: "Load data", pt: "Carregar dados", es: "Cargar datos", fr: "Charger les données" },
  reset: { en: "Reset", pt: "Repor", es: "Restablecer", fr: "Réinitialiser" },
  downloadBoth: {
    en: "Download CV + Letter (PDF)",
    pt: "Transferir CV + Carta (PDF)",
    es: "Descargar CV + Carta (PDF)",
    fr: "Télécharger CV + Lettre (PDF)",
  },

  moreStyling: { en: "More styling ▾", pt: "Mais estilos ▾", es: "Más estilos ▾", fr: "Plus de styles ▾" },
  customAccent: {
    en: "Custom accent color",
    pt: "Cor de destaque personalizada",
    es: "Color de acento personalizado",
    fr: "Couleur d'accent personnalisée",
  },
  fontPairing: { en: "Font pairing", pt: "Combinação de fontes", es: "Combinación de fuentes", fr: "Association de polices" },
  pageSize: { en: "Page size", pt: "Tamanho da página", es: "Tamaño de página", fr: "Format de page" },
  qrCode: { en: "QR code", pt: "Código QR", es: "Código QR", fr: "Code QR" },
  photoPosition: { en: "Photo position", pt: "Posição da foto", es: "Posición de la foto", fr: "Position de la photo" },
  left: { en: "Left", pt: "Esquerda", es: "Izquierda", fr: "Gauche" },
  right: { en: "Right", pt: "Direita", es: "Derecha", fr: "Droite" },
  darkMode: { en: "Dark background", pt: "Fundo escuro", es: "Fondo oscuro", fr: "Fond sombre" },
  on: { en: "On", pt: "Ativado", es: "Activado", fr: "Activé" },
  off: { en: "Off", pt: "Desativado", es: "Desactivado", fr: "Désactivé" },

  sectionOrder: { en: "Section order", pt: "Ordem das secções", es: "Orden de secciones", fr: "Ordre des sections" },
  sectionOrderHint: {
    en: "Drag to reorder. Toggle to show or hide on your CV. The color swatch overrides this section's accent.",
    pt: "Arraste para reordenar. Ative ou desative para mostrar no CV. A cor substitui o destaque desta secção.",
    es: "Arrastra para reordenar. Activa o desactiva para mostrar en el CV. El color sobrescribe el acento de esta sección.",
    fr: "Glissez pour réorganiser. Activez ou masquez sur le CV. La couleur remplace l'accent de cette section.",
  },
  personalDetails: { en: "Personal details", pt: "Dados pessoais", es: "Datos personales", fr: "Coordonnées" },
  fullName: { en: "Full name", pt: "Nome completo", es: "Nombre completo", fr: "Nom complet" },
  roleTitle: { en: "Role / title", pt: "Cargo / título", es: "Puesto / título", fr: "Poste / titre" },
  email_field: { en: "Email", pt: "E-mail", es: "Correo", fr: "E-mail" },
  phone: { en: "Phone", pt: "Telefone", es: "Teléfono", fr: "Téléphone" },
  location: { en: "Location", pt: "Localização", es: "Ubicación", fr: "Localisation" },
  website: { en: "Website", pt: "Website", es: "Sitio web", fr: "Site web" },
  photo: { en: "Photo", pt: "Foto", es: "Foto", fr: "Photo" },
  upload: { en: "Upload", pt: "Carregar", es: "Subir", fr: "Téléverser" },
  change: { en: "Change", pt: "Alterar", es: "Cambiar", fr: "Changer" },
  remove: { en: "Remove", pt: "Remover", es: "Eliminar", fr: "Supprimer" },

  summary: { en: "Summary", pt: "Resumo", es: "Resumen", fr: "Résumé" },
  summaryPlaceholder: {
    en: "A short professional summary…",
    pt: "Um breve resumo profissional…",
    es: "Un breve resumen profesional…",
    fr: "Un bref résumé professionnel…",
  },
  charactersLabel: { en: "characters", pt: "caracteres", es: "caracteres", fr: "caractères" },
  summaryTooLong: {
    en: "a bit long for one page; consider trimming.",
    pt: "um pouco longo para uma página; considere reduzir.",
    es: "un poco largo para una página; considera acortarlo.",
    fr: "un peu long pour une page ; envisagez de raccourcir.",
  },

  experience: { en: "Experience", pt: "Experiência", es: "Experiencia", fr: "Expérience" },
  role: { en: "Role", pt: "Cargo", es: "Puesto", fr: "Poste" },
  company: { en: "Company", pt: "Empresa", es: "Empresa", fr: "Entreprise" },
  start: { en: "Start", pt: "Início", es: "Inicio", fr: "Début" },
  end: { en: "End", pt: "Fim", es: "Fin", fr: "Fin" },
  description: { en: "Description", pt: "Descrição", es: "Descripción", fr: "Description" },
  duplicateCompanyWarning: {
    en: "Another entry also lists this company — check this isn't an accidental duplicate.",
    pt: "Outro item também tem esta empresa — confirme que não é uma duplicação acidental.",
    es: "Otra entrada también tiene esta empresa — comprueba que no sea un duplicado accidental.",
    fr: "Une autre entrée mentionne aussi cette entreprise — vérifiez qu'il ne s'agit pas d'un doublon.",
  },

  education: { en: "Education", pt: "Formação", es: "Educación", fr: "Formation" },
  degree: { en: "Degree", pt: "Grau", es: "Título", fr: "Diplôme" },
  school: { en: "School", pt: "Escola", es: "Escuela", fr: "École" },

  skills: { en: "Skills", pt: "Competências", es: "Habilidades", fr: "Compétences" },
  skillCategoryHint: {
    en: "Optional category groups skills together on the CV (e.g. \"Tools\", \"Soft skills\"). Leave blank to keep one flat list.",
    pt: "A categoria (opcional) agrupa competências no CV (ex. \"Ferramentas\"). Deixe em branco para uma lista única.",
    es: "La categoría (opcional) agrupa habilidades en el CV (p.ej. \"Herramientas\"). Déjalo en blanco para una sola lista.",
    fr: "La catégorie (facultative) regroupe les compétences sur le CV. Laissez vide pour une liste unique.",
  },
  category: { en: "Category", pt: "Categoria", es: "Categoría", fr: "Catégorie" },

  projects: { en: "Projects", pt: "Projetos", es: "Proyectos", fr: "Projets" },
  name: { en: "Name", pt: "Nome", es: "Nombre", fr: "Nom" },
  link: { en: "Link", pt: "Link", es: "Enlace", fr: "Lien" },

  languages: { en: "Languages", pt: "Idiomas", es: "Idiomas", fr: "Langues" },
  language: { en: "Language", pt: "Idioma", es: "Idioma", fr: "Langue" },
  fluency: { en: "Fluency", pt: "Fluência", es: "Fluidez", fr: "Niveau" },

  customSections: { en: "Custom sections", pt: "Secções personalizadas", es: "Secciones personalizadas", fr: "Sections personnalisées" },
  customSectionsHint: {
    en: "Add your own section — certifications, awards, publications, references, anything.",
    pt: "Adicione a sua própria secção — certificações, prémios, publicações, referências, o que quiser.",
    es: "Añade tu propia sección — certificaciones, premios, publicaciones, referencias, lo que sea.",
    fr: "Ajoutez votre propre section — certifications, distinctions, publications, références, etc.",
  },
  removeSection: { en: "Remove section", pt: "Remover secção", es: "Eliminar sección", fr: "Supprimer la section" },
  entryTitle: { en: "Title", pt: "Título", es: "Título", fr: "Titre" },
  entrySubtitle: { en: "Subtitle", pt: "Subtítulo", es: "Subtítulo", fr: "Sous-titre" },
  newSectionPlaceholder: {
    en: "New section name, e.g. Certifications",
    pt: "Nome da nova secção, ex. Certificações",
    es: "Nombre de la nueva sección, ej. Certificaciones",
    fr: "Nom de la nouvelle section, ex. Certifications",
  },
  add: { en: "Add", pt: "Adicionar", es: "Añadir", fr: "Ajouter" },
  duplicateEntry: { en: "Duplicate", pt: "Duplicar", es: "Duplicar", fr: "Dupliquer" },

  addExperience: { en: "+ Add experience", pt: "+ Adicionar experiência", es: "+ Añadir experiencia", fr: "+ Ajouter une expérience" },
  addEducation: { en: "+ Add education", pt: "+ Adicionar formação", es: "+ Añadir educación", fr: "+ Ajouter une formation" },
  addSkill: { en: "+ Add skill", pt: "+ Adicionar competência", es: "+ Añadir habilidad", fr: "+ Ajouter une compétence" },
  addProject: { en: "+ Add project", pt: "+ Adicionar projeto", es: "+ Añadir proyecto", fr: "+ Ajouter un projet" },
  addLanguage: { en: "+ Add language", pt: "+ Adicionar idioma", es: "+ Añadir idioma", fr: "+ Ajouter une langue" },
  addEntry: { en: "+ Add entry", pt: "+ Adicionar item", es: "+ Añadir elemento", fr: "+ Ajouter un élément" },

  editTab: { en: "Edit", pt: "Editar", es: "Editar", fr: "Modifier" },
  previewTab: { en: "Preview", pt: "Pré-visualizar", es: "Vista previa", fr: "Aperçu" },

  landingTitle: {
    en: "Build a CV you're proud of, in minutes.",
    pt: "Crie um CV do qual se orgulhe, em minutos.",
    es: "Crea un CV del que te sientas orgulloso, en minutos.",
    fr: "Créez un CV dont vous serez fier, en quelques minutes.",
  },
  landingSubtitle: {
    en: "Free templates, drag-and-drop sections, instant PDF & Word export. No account, no server — everything stays on your device.",
    pt: "Modelos gratuitos, secções de arrastar e soltar, exportação instantânea para PDF e Word. Sem conta, sem servidor — tudo fica no seu dispositivo.",
    es: "Plantillas gratuitas, secciones de arrastrar y soltar, exportación instantánea a PDF y Word. Sin cuenta, sin servidor — todo se queda en tu dispositivo.",
    fr: "Modèles gratuits, sections à glisser-déposer, export PDF et Word instantané. Pas de compte, pas de serveur — tout reste sur votre appareil.",
  },
  landingCTA: { en: "Start building — it's free", pt: "Começar — é grátis", es: "Empezar — es gratis", fr: "Commencer — c'est gratuit" },

  savedJustNow: { en: "Saved", pt: "Guardado", es: "Guardado", fr: "Enregistré" },

  onboardingTitle: { en: "Getting started", pt: "Primeiros passos", es: "Primeros pasos", fr: "Pour commencer" },
  onboardingStep1: { en: "Fill in your personal details", pt: "Preencha os seus dados pessoais", es: "Completa tus datos personales", fr: "Renseignez vos coordonnées" },
  onboardingStep2: { en: "Add your experience and education", pt: "Adicione experiência e formação", es: "Añade tu experiencia y educación", fr: "Ajoutez expérience et formation" },
  onboardingStep3: { en: "Pick a template that fits", pt: "Escolha um modelo à sua medida", es: "Elige una plantilla adecuada", fr: "Choisissez un modèle adapté" },
  onboardingStep4: { en: "Download your PDF or Word file", pt: "Transfira o seu PDF ou Word", es: "Descarga tu PDF o Word", fr: "Téléchargez votre PDF ou Word" },
  dismiss: { en: "Dismiss", pt: "Dispensar", es: "Descartar", fr: "Ignorer" },
} as const;

export type DictKey = keyof typeof dict;

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return (key: DictKey) => dict[key][locale];
}
