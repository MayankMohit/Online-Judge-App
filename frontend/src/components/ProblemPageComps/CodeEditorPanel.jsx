import { Editor } from "@monaco-editor/react";
import { ArrowLeft, CheckCheck, Play, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSaveSuccess } from "../../features/code/codePersistenceSlice";
import { languageBoilerplates } from "./LanguageBoilerplates";

const CodeEditorPanel = ({
  language, setLanguage, code,
  handleCodeChange,
  handleMobileCodeChange,
  onBackToDescription, isMobile, onRun, onSubmit, currentProblem,
}) => {
  const dispatch = useDispatch();
  const tickTimeoutRef = useRef(null);
  const [fadeTick, setFadeTick] = useState(false);

  const { saving, saveSuccess } = useSelector((state) => state.codePersistence);
  const { loading, lastAction } = useSelector((state) => state.code);

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
  }, [isMobile, onRun, onSubmit, loading, lastAction]);

  const isLoading = loading && (lastAction === "run" || lastAction === "submit");

  const mobileEditorKey = `mobile-${language}-${currentProblem?._id}`;

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
          <option key={lang} value={lang} disabled={lang === "js" || lang === "javascript"}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
        <option value="java" disabled>Java</option>
        <option value="go" disabled>Go</option>
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
            className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40"
            onClick={onRun}
            disabled={isLoading}
          >
            <Play size={11} />
            Run
          </button>
          {/* Shortcut tooltip — desktop only */}
          {!isMobile && (
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 whitespace-nowrap shadow-lg z-50">
              <kbd className="text-[10px] text-zinc-300 font-mono bg-zinc-700 px-1 py-0.5 rounded">Ctrl</kbd>
              <span className="text-zinc-500 text-[10px]">+</span>
              <kbd className="text-[10px] text-zinc-300 font-mono bg-zinc-700 px-1 py-0.5 rounded">'</kbd>
            </div>
          )}
        </div>

        {/* Submit button — Ctrl+Enter on desktop */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40"
            onClick={onSubmit}
            disabled={isLoading}
          >
            <Send size={11} />
            Submit
          </button>
          {/* Shortcut tooltip — desktop only */}
          {!isMobile && (
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 whitespace-nowrap shadow-lg z-50">
              <kbd className="text-[10px] text-zinc-300 font-mono bg-zinc-700 px-1 py-0.5 rounded">Ctrl</kbd>
              <span className="text-zinc-500 text-[10px]">+</span>
              <kbd className="text-[10px] text-zinc-300 font-mono bg-zinc-700 px-1 py-0.5 rounded">Enter</kbd>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sharedOptions = {
    fontSize: 13,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: "on",
    tabSize: 2,
    formatOnType: true,
    formatOnPaste: true,
    lineNumbersMinChars: 3,
    padding: { top: 8 },
  };

  return (
    <div className={`flex flex-col ${isMobile ? "min-w-full h-full bg-zinc-950" : "h-full"}`}>
      {toolbar}

      {isMobile ? (
        <Editor
          key={mobileEditorKey}
          height="80vh"
          defaultLanguage={language}
          language={language}
          defaultValue={code}
          onChange={handleMobileCodeChange}
          theme="vs-dark"
          options={sharedOptions}
        />
      ) : (
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={sharedOptions}
        />
      )}
    </div>
  );
};

export default CodeEditorPanel;