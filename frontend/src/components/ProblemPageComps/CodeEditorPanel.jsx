import { Editor } from "@monaco-editor/react";
import { ArrowLeft } from "lucide-react";
import { languageBoilerplates } from "./LanguageBoilerPlates";

const CodeEditorPanel = ({
  language,
  setLanguage,
  code,
  customInput,
  setCustomInput,
  setCodeMap,
  onBackToDescription,
  isMobile,
  onRun,
  onSubmit,
}) => {
  return (
    <div
      className={`flex flex-col ${
        isMobile ? "min-w-full h-full bg-gray-950" : "h-full"
      }`}
    >
      {/* Top Bar */}
      <div
        className={`relative flex items-center px-2 py-2 bg-gray-800 border-b border-gray-700 ${
          isMobile ? "justify-between" : "justify-start"
        }`}
      >
        {/* Mobile back button */}
        {isMobile && (
          <button
            onClick={onBackToDescription}
            className="text-purple-300 text-sm bg-gray-700 px-2 py-1 rounded"
          >
            <ArrowLeft size={15} strokeWidth={3} />
          </button>
        )}

        {/* Language selector */}
        <select
          className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {Object.keys(languageBoilerplates).map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
          <option value="java" disabled={true}>
            Java
          </option>
          <option value="go" disabled={true}>
            Go
          </option>
        </select>

        {/* Run / Submit */}
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

      {/* Monaco Editor */}
      <Editor
        height={isMobile ? "80vh" : "100%"}
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={(val) => {
          setCodeMap((prev) => ({ ...prev, [language]: val }));
        }}
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
          validate: true,
        }}
      />
    </div>
  );
};

export default CodeEditorPanel;