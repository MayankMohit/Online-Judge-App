import { languageBoilerplates } from "../components/ProblemPageComps/LanguageBoilerplates";

// Remembers which editor language the user last picked, so opening any problem
// pre-selects it instead of always defaulting to C++. Stored per-device in
// localStorage (a language choice is inherently a per-device editor preference).

const STORAGE_KEY = "preferredLanguage";
const DEFAULT_LANGUAGE = "cpp";
// Kept in sync with the disabled <option>s in CodeEditorPanel (toolchains omitted
// on the 1GB host) so we never pre-select a language the user can't actually run.
const DISABLED = new Set(["go", "rust"]);

export const isSelectableLanguage = (lang) =>
  !!lang && lang in languageBoilerplates && !DISABLED.has(lang);

export const getPreferredLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isSelectableLanguage(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    // localStorage blocked (private mode) — fall back to the default.
    return DEFAULT_LANGUAGE;
  }
};

export const savePreferredLanguage = (lang) => {
  try {
    if (isSelectableLanguage(lang)) localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable — the preference just won't persist this session.
  }
};
