import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { ArrowLeft, CheckCheck, Play, Send } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSaveSuccess } from "../../features/code/codePersistenceSlice";
import { languageBoilerplates } from "./LanguageBoilerplates";
import { editorExtensions } from "./editorTheme";

// Map our language codes to CodeMirror language extensions.
const languageExtension = (language) => {
  switch (language) {
    case "cpp":
    case "c":
      return [cpp()];
    case "py":
    case "python":
      return [python()];
    case "js":
    case "javascript":
      return [javascript()];
    case "java":
      return [java()];
    default:
      return [];
  }
};

const CodeEditorPanel = ({
  language, setLanguage, code,
  handleCodeChange,
  onBackToDescription, isMobile, onRun, onSubmit,
}) => {
  const dispatch = useDispatch();
  const tickTimeoutRef = useRef(null);
  const [fadeTick, setFadeTick] = useState(false);

  const { saving, saveSuccess } = useSelector((state) => state.codePersistence);
  const { loading, lastAction } = useSelector((state) => state.code);

  const isLoading = loading && (lastAction === "run" || lastAction === "submit");

  useEffect(() => {
    if (saveSuccess) {
      setFadeTick(false);
      tickTimeoutRef.current = setTimeout(() => setFadeTick(true), 1000);
      setTimeout(() => dispatch(clearSaveSuccess()), 2000);
    }
    return () => clearTimeout(tickTimeoutRef.current);
  }, [saveSuccess, dispatch]);

  // Keyboard shortcuts — desktop only
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e) => {
      if (isLoading) return;
      // Ctrl + ' → Run
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        onRun();
      }
      // Ctrl + Enter → Submit
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, onRun, onSubmit, isLoading]);

  const extensions = useMemo(
    () => [EditorView.lineWrapping, ...editorExtensions, ...languageExtension(language)],
    [language]
  );

  const toolbar = (
    <div className={`flex items-center px-3 py-2 bg-zinc-900 border-b border-zinc-800 gap-2 overflow-visible ${isMobile ? "justify-between" : ""}`}>
      {isMobile && (
        <button
          onClick={onBackToDescription}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
        </button>
      )}

      <select
        className="bg-zinc-800 border border-zinc-700 text-white px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-purple-500 transition"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {Object.keys(languageBoilerplates).map((lang) => (
          <option
            key={lang}
            value={lang}
            // go/rust toolchains omitted from the image (1GB host); rest enabled.
            disabled={["go", "rust"].includes(lang)}
          >
            {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>

      <div className="flex-1 flex items-center">
        {saving && <span className="text-zinc-600 text-xs">Saving...</span>}
        {!saving && saveSuccess && (
          <CheckCheck
            className={`text-zinc-600 transition-opacity duration-1000 ${fadeTick ? "opacity-0" : "opacity-100"}`}
            size={14}
          />
        )}
      </div>

      <div className="flex gap-2">
        {/* Run button — Ctrl+' on desktop */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            onClick={onRun}
            disabled={isLoading}
          >
            <Play size={11} />
            Run
          </button>
        </div>

        {/* Submit button — Ctrl+Enter on desktop */}
        <div className="relative group">
          <button
            className={`flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 ${isLoading && lastAction === "submit" ? "px-8" : "px-3"} py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`}
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading && lastAction === "submit" ? " " : <Send size={11} />}
            {isLoading && lastAction === "submit" ?
             <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col ${isMobile ? "flex-1 min-h-0 bg-zinc-950" : "h-full"}`}>
      {toolbar}

      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme="none"
          extensions={extensions}
          onChange={handleCodeChange}
          basicSetup={{ tabSize: 2 }}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
