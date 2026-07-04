import es from "./es";
import en from "./en";
import pt from "./pt";

export const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇨🇱" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português (BR)", flag: "🇧🇷" },
];

export const translations = { es, en, pt };

export function getTranslations(lang) {
  return translations[lang] || translations.es;
}