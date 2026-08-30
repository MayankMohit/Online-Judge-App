import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";

/**
 * Single source of truth for the languages the UI offers.
 *
 * These ids mirror the aliases in compiler-service/src/languages/index.js, which
 * is what the judge actually resolves. `available` tracks whether the toolchain
 * is installed in the compiler image — Go and Rust are registered in the judge
 * but deliberately left out of the Docker image to keep it small on the 1GB
 * host, so selecting them would only ever produce a compile failure.
 *
 * This list previously lived in three places (the solver editor, the code viewer
 * and the admin reference-solution panel) and had already drifted: the admin
 * panel offered only C++, C and Python.
 */
export const JUDGE_LANGUAGES = [
  { id: "cpp", label: "C++", available: true },
  { id: "c", label: "C", available: true },
  { id: "python", label: "Python", available: true },
  { id: "javascript", label: "JavaScript", available: true },
  { id: "java", label: "Java", available: true },
  { id: "go", label: "Go", available: false },
  { id: "rust", label: "Rust", available: false },
];

// Aliases the backend stores on submissions ("py", "js") alongside the ids the
// UI sends ("python", "javascript").
const ALIASES = {
  "c++": "cpp",
  py: "python",
  python3: "python",
  js: "javascript",
  node: "javascript",
  golang: "go",
  rs: "rust",
};

const normalize = (language) => {
  const key = String(language || "").toLowerCase();
  return ALIASES[key] || key;
};

export const AVAILABLE_LANGUAGES = JUDGE_LANGUAGES.filter((l) => l.available);

export const isLanguageAvailable = (language) =>
  JUDGE_LANGUAGES.some((l) => l.id === normalize(language) && l.available);

export const languageLabel = (language) =>
  JUDGE_LANGUAGES.find((l) => l.id === normalize(language))?.label ?? language;

/** CodeMirror grammar for a language id. Go and Rust have no grammar installed,
 *  so they fall through to plain text — harmless, since neither is selectable. */
export const languageExtension = (language) => {
  switch (normalize(language)) {
    case "cpp":
    case "c":
      return [cpp()];
    case "python":
      return [python()];
    case "javascript":
      return [javascript()];
    case "java":
      return [java()];
    default:
      return [];
  }
};
