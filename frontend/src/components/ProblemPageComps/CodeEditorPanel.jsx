import { Editor } from "@monaco-editor/react";
import { ArrowLeft, CheckCheck, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCodeLocally,
  saveCodeToDB,
  clearSaveSuccess,
} from "../../features/code/codePersistenceSlice";
import { languageBoilerplates } from "./LanguageBoilerplates";

const CodeEditorPanel = ({
  language,
  setLanguage,
  code,
  customInput,
  setCustomInput,
  onBackToDescription,
  isMobile,
  onRun,
  onSubmit,
  currentProblem,
}) => {
  const dispatch = useDispatch();
  const saveDebounceRef = useRef(null);
  const tickTimeoutRef = useRef(null);

  const { saving, saveSuccess } = useSelector((state) => state.codePersistence);

  // 🔹 Debounced save on code change
  const handleCodeChange = (val) => {
    const problemId = currentProblem?._id;
    if (!problemId) return;

    // Local update
    dispatch(updateCodeLocally({ problemId, language, code: val }));

    // Debounced save
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      dispatch(saveCodeToDB({ problemId, language, code: val }));
    }, 2000);
  };

  // 🔹 Auto-clear tick after success
  useEffect(() => {
    if (saveSuccess) {
      tickTimeoutRef.current = setTimeout(() => {
        dispatch(clearSaveSuccess());
      }, 2000);
    }
    return () => clearTimeout(tickTimeoutRef.current);
  }, [saveSuccess, dispatch]);

  return (
    <div
      className={`flex flex-col ${
        isMobile ? "min-w-full h-full bg-gray-950" : "h-full"
      }`}
    >
      {/* 🔹 Top Toolbar */}
      <div
        className={`relative flex items-center px-2 py-2 bg-gray-800 border-b border-gray-700 ${
          isMobile ? "justify-between" : "justify-start"
        }`}
      >
        {/* 🔸 Back Button (Mobile Only) */}
        {isMobile && (
          <button
            onClick={onBackToDescription}
            className="text-purple-300 text-sm bg-gray-700 px-2 py-1 rounded"
          >
            <ArrowLeft size={15} strokeWidth={3} />
          </button>
        )}

        {/* 🔸 Language Selector */}
        <select
          className="bg-gray-900 text-white px-3 py-2 rounded text-sm mr-52"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {Object.keys(languageBoilerplates).map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
          <option value="java" disabled>
            Java (Coming Soon)
          </option>
          <option value="go" disabled>
            Go (Coming Soon)
          </option>
        </select>

        {/* 🔸 Save Status Indicator */}
        <div className="flex items-center space-x-2 mr-3">
          {saving && (
            <Loader2 className="animate-spin text-gray-600" size={25} />
          )}
          {!saving && saveSuccess && (
            <CheckCheck className="text-gray-500" size={25} />
          )}
        </div>

        {/* 🔸 Run & Submit Buttons */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex gap-3">
          <button
            className="bg-blue-500 px-4 py-1.5 text-white rounded text-sm opacity-80 hover:opacity-100"
            onClick={onRun}
          >
            Run
          </button>
          <button
            className="bg-green-600 px-4 py-1.5 text-white rounded text-sm opacity-80 hover:opacity-100"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {/* 🔹 Monaco Editor */}
      <Editor
        height={isMobile ? "80vh" : "100%"}
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          formatOnType: true,
          formatOnPaste: true,
        }}
      />
    </div>
  );
};

export default CodeEditorPanel;
