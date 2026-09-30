export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "languages"
  | "custom";

export interface PersonalInfo {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string; // base64 data url, optional
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1-5
  category: string; // optional grouping, e.g. "Tools", "Soft skills" (empty = ungrouped)
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

// A free-form entry inside a user-defined custom section
// (certifications, publications, awards, references, etc.)
export interface CustomEntry {
  id: string;
  heading: string;
  subheading: string;
  start: string;
  end: string;
  description: string;
}

export interface CustomSectionBlock {
  id: string;
  title: string;
  entries: CustomEntry[];
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  color?: string; // per-section accent override; falls back to cv.accentColor
}

export type Density = "compact" | "comfortable";
export type FontScale = "sm" | "md" | "lg";
export type PageSize = "a4" | "letter";
export type FontPairId = "default" | "serif" | "grotesk";
export type PhotoPosition = "left" | "right";

export interface CVSettings {
  density: Density;
  fontScale: FontScale;
  pageSize: PageSize;
  fontPair: FontPairId;
  qrEnabled: boolean;
  qrTarget: string; // usually the website/portfolio URL
  photoPosition: PhotoPosition;
  darkMode: boolean; // for templates that support a dark variant
}

export interface CVData {
  templateId: string;
  accentColor: string;
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  customSections: CustomSectionBlock[];
  sections: CVSection[];
  settings: CVSettings;
}

export interface CVSnapshot {
  id: string;
  name: string;
  data: CVData;
  createdAt: number;
}

export interface CVProfile {
  id: string;
  name: string;
  data: CVData;
  updatedAt: number;
  snapshots: CVSnapshot[];
}

export interface CoverLetterData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientCompany: string;
  date: string;
  subject: string;
  body: string; // paragraphs separated by blank lines
  closing: string;
}

export const emptyCoverLetter: CoverLetterData = {
  senderName: "Your Name",
  senderEmail: "you@example.com",
  senderPhone: "+1 555 000 0000",
  recipientName: "Hiring Manager",
  recipientCompany: "Company Name",
  date: "",
  subject: "Application for [Role]",
  body: "I'm writing to apply for the [Role] position at [Company]. In my current role I've...\n\nI'd welcome the chance to discuss how my background fits your team.",
  closing: "Sincerely,",
};

export const emptyCV: CVData = {
  templateId: "modern",
  accentColor: "#3F7368",
  personal: {
    fullName: "Your Name",
    role: "Your Role",
    email: "you@example.com",
    phone: "+1 555 000 0000",
    location: "City, Country",
    website: "",
    photo: "",
  },
  summary:
    "A short, confident summary of your professional background and what you're looking for next.",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  customSections: [],
  sections: [
    { id: "summary", type: "summary", title: "Summary", visible: true },
    { id: "experience", type: "experience", title: "Experience", visible: true },
    { id: "education", type: "education", title: "Education", visible: true },
    { id: "skills", type: "skills", title: "Skills", visible: true },
    { id: "projects", type: "projects", title: "Projects", visible: false },
    { id: "languages", type: "languages", title: "Languages", visible: false },
  ],
  settings: {
    density: "comfortable",
    fontScale: "md",
    pageSize: "a4",
    fontPair: "default",
    qrEnabled: false,
    qrTarget: "",
    photoPosition: "left",
    darkMode: false,
  },
};
