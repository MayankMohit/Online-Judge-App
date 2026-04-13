import { Editor } from "@monaco-editor/react";
import { ArrowLeft, CheckCheck, Play, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSaveSuccess } from "../../features/code/codePersistenceSlice";
import { languageBoilerplates } from "./LanguageBoilerplates";

const CodeEditorPanel = ({
  language, setLanguage, code,
  handleCodeChange,
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

  

  const isLoading = loading && (lastAction === "run" || lastAction === "submit");

  return (
    <div className={`flex flex-col ${isMobile ? "min-w-full h-full bg-zinc-950" : "h-full"}`}>
      {/* Toolbar */}
      <div className={`flex items-center px-3 py-2 bg-zinc-900 border-b border-zinc-800 gap-2 ${isMobile ? "justify-between" : ""}`}>
        {isMobile && (
          <button
            onClick={onBackToDescription}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
          </button>
        )}

        {/* Language selector */}
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

        {/* Save indicator */}
        <div className="flex-1 flex items-center">
          {saving && <span className="text-zinc-600 text-xs">Saving...</span>}
          {!saving && saveSuccess && (
            <CheckCheck
              className={`text-zinc-600 transition-opacity duration-1000 ${fadeTick ? "opacity-0" : "opacity-100"}`}
              size={14}
            />
          )}
        </div>

        {/* Run & Submit */}
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40"
            onClick={onRun}
            disabled={isLoading}
          >
            <Play size={11} />
            Run
          </button>
          <button
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-white rounded-lg text-xs font-medium transition disabled:opacity-40"
            onClick={onSubmit}
            disabled={isLoading}
          >
            <Send size={11} />
            Submit
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={isMobile ? "80vh" : "100%"}
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
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
        }}
      />
    </div>
  );
};

export default CodeEditorPanel;