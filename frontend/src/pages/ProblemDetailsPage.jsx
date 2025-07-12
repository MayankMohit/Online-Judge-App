import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ArrowLeft, ArrowBigUp } from "lucide-react";
import {
  fetchProblemByNumber,
  clearCurrentProblem,
} from "../features/problems/problemsSlice";
import { runCode, submitCode } from "../features/code/codeSlice";
import { toast } from "react-hot-toast";

// Constants
const languageBoilerplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
  python: `def main():
    # Write your code here
    pass

if __name__ == "__main__":
    main()`,
  javascript: `function main() {
  // Write your code here
}

main();`,
};

const difficultyColors = {
  Easy: "text-green-400 bg-green-950",
  Medium: "text-yellow-400 bg-yellow-950",
  Hard: "text-red-400 bg-red-950",
};



// Components
const ProblemHeader = ({
  problemNumber,
  title,
  difficulty,
  tags,
}) => (
  <div className="flex items-center gap-4 mb-4">
    <div>
      <h1 className="text-2xl font-bold">
        {problemNumber}. {title}
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`px-2 py-1 rounded text-xs ${difficultyColors[difficulty] || "text-gray-400 bg-gray-700"}`}
        >
          {difficulty}
        </span>
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center ml-5">
            Topics:
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-800 text-purple-400 px-2 py-1 rounded text-xs capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProblemDescription = ({
  description,
  inputFormat,
  outputFormat,
  constraints,
  visibleTestCases,
}) => (
  <>
    <div className="text-gray-300 whitespace-pre-wrap mb-6 text-lg">
      {description}
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Input Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{inputFormat}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Output Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{outputFormat}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Constraints</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{constraints}</p>
    </div>
    <h2 className="text-lg font-semibold mb-3">Sample Input Output</h2>
    {visibleTestCases?.length ? (
      visibleTestCases.map((tc, i) => (
        <TestCase key={i} input={tc.input} output={tc.expectedOutput} />
      ))
    ) : (
      <p className="text-gray-500 italic">No sample input/output.</p>
    )}
  </>
);

const TestCase = ({ input, output }) => (
  <div className="bg-gray-800 p-3 rounded mb-4">
    <p className="mb-1">
      <span className="text-purple-400 font-medium">Input:</span>
      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {input}
      </pre>
    </p>
    <p>
      <span className="text-purple-400 font-medium">Output:</span>
      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {output}
      </pre>
    </p>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    className={`px-3 rounded text-xs font-medium transition-colors ${
      active
        ? "bg-purple-900 text-gray-300 py-2"
        : "bg-gray-900 text-gray-400 hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const CodeEditorPanel = ({
  language,
  setLanguage,
  code,
  setCodeMap,
  onBackToDescription,
  isMobile,
}) => (
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
      </select>

      {/* Run / Submit */}
      <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex gap-3">
        <button className="bg-blue-500 px-4 py-1.5 text-white rounded text-sm opacity-80 hover:opacity-100">
          Run
        </button>
        <button className="bg-green-600 px-4 py-1.5 text-white rounded text-sm opacity-80 hover:opacity-100">
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

const ProblemDetailsPage = () => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProblem, problemLoading, problemError } = useSelector(
    (state) => state.problems
  );

  // Layout state
  const [leftWidth, setLeftWidth] = useState(35);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [editorHeight, setEditorHeight] = useState(70);
  const [testcaseHeight, setTestcaseHeight] = useState(30);
  const isDraggingHeight = useRef(false);
  const mobileScrollRef = useRef(null);

  // Problem state
  const [activeTab, setActiveTab] = useState("description");
  const [customInput, setCustomInput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [codeMap, setCodeMap] = useState({ ...languageBoilerplates });

  const code = codeMap[language];

  useEffect(() => {
    dispatch(fetchProblemByNumber(number));
    return () => dispatch(clearCurrentProblem());
  }, [dispatch, number]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const offsetX =
        e.clientX - containerRef.current.getBoundingClientRect().left;

      const minLeftPercent = 10;
      const maxLeftPercent = 90;

      const newLeftWidth = Math.min(
        Math.max((offsetX / containerWidth) * 100, minLeftPercent),
        maxLeftPercent
      );
      setLeftWidth(newLeftWidth);
    }

    if (isDraggingHeight.current && containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const offsetY =
        e.clientY - containerRef.current.getBoundingClientRect().top;

      const minHeightPx = 100; // minimum height for test case panel
      const minEditorPercent = (minHeightPx / containerHeight) * 100;

      const newEditorHeight = Math.min(
        Math.max((offsetY / containerHeight) * 100, 20),
        100 - minEditorPercent
      );

      setEditorHeight(newEditorHeight);
      setTestcaseHeight(100 - newEditorHeight);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isDraggingHeight.current = false;
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (problemLoading)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-opacity-60"></div>
      </div>
    );

  if (problemError)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-lg">{problemError}</div>
      </div>
    );
  if (!currentProblem) return null;

  const {
    title,
    problemNumber,
    difficulty,
    tags,
    statement: description,
    inputFormat,
    outputFormat,
    constraints,
    testCases,
  } = currentProblem;

  const visibleTestCases = testCases?.filter((tc) => !tc.isHidden)?.slice(0, 2);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen md:flex bg-gray-900 text-white overflow-hidden"
    >
      {/* Mobile View */}
      <div
        className="flex flex-row md:hidden w-full h-full overflow-x-hidden scroll-smooth"
        ref={mobileScrollRef}
      >
        {/* Description Panel (mobile) */}
        <div className="min-w-full h-full flex flex-col border-r border-gray-800">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="text-purple-400 hover:text-purple-300"
              >
                <ArrowLeft size={28} strokeWidth={2.5} />
              </button>
              <TabButton
                active={activeTab === "description"}
                onClick={() => setActiveTab("description")}
              >
                Description
              </TabButton>
              <TabButton
                active={activeTab === "submissions"}
                onClick={() => setActiveTab("submissions")}
              >
                Submissions
              </TabButton>
            </div>
            <button
              onClick={() => {
                mobileScrollRef.current?.scrollTo({
                  left: window.innerWidth,
                  behavior: "smooth",
                });
              }}
              className="text-purple-200 text-sm bg-gray-700 px-2 py-1 rounded"
            >
              Code →
            </button>
          </div>
          <div className="overflow-y-auto p-4 text-sm hide-scrollbar">
            {activeTab === "description" && (
              <ProblemHeader
                problemNumber={problemNumber}
                title={title}
                difficulty={difficulty}
                tags={tags}
                navigate={navigate}
              />
            )}
            {activeTab === "description" && (
              <ProblemDescription
                description={description}
                inputFormat={inputFormat}
                outputFormat={outputFormat}
                constraints={constraints}
                visibleTestCases={visibleTestCases}
              />
            )}
            {activeTab === "submissions" && (
              <p className="text-gray-400 italic">
                Submissions view coming soon.
              </p>
            )}
          </div>
        </div>

        {/* Code Editor Panel (mobile) */}
        <div className="min-w-full h-full flex flex-col bg-gray-950">
          <CodeEditorPanel
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCodeMap={setCodeMap}
            customInput={customInput}
            setCustomInput={setCustomInput}
            onBackToDescription={() => {
              mobileScrollRef.current?.scrollTo({
                left: 0,
                behavior: "smooth",
              });
            }}
            isMobile={true}
          />
          {/* Custom Test Case Area (mobile) */}
          <div className="bg-gray-900 p-4 min-h-40 text-sm flex flex-col gap-2 overflow-hidden hide-scrollbar">
            <h3 className="text-purple-400 font-semibold mb-1">
              Custom Test Case{" "}
              <ArrowBigUp size={30} className="inline-block ml-2" />
            </h3>
            <textarea
              className="bg-gray-800 text-white p-2 rounded resize-none h-full hide-scrollbar"
              placeholder="Enter input here..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex w-full h-full">
        {/* LEFT PANEL */}
        <div
          className="h-full flex flex-col border-r border-gray-800 min-w-[25vw] hide-scrollbar"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Top Bar */}
          <div className="flex items-center bg-gray-800 px-4 py-2 border-b border-gray-700">
            <button
              onClick={() => navigate(-1)}
              className="text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft size={35} strokeWidth={3} />
            </button>
            <div className="flex gap-2 ml-5">
              <TabButton
                active={activeTab === "description"}
                onClick={() => setActiveTab("description")}
                className="text-sm py-1.5"
              >
                Description
              </TabButton>
              <TabButton
                active={activeTab === "submissions"}
                onClick={() => setActiveTab("submissions")}
                className="text-sm py-1.5"
              >
                Submissions
              </TabButton>
            </div>
          </div>

          {/* Problem Content */}
          <div className="p-6 overflow-y-auto text-sm hide-scrollbar">
            {activeTab === "description" && (
              <>
                <ProblemHeader
                  problemNumber={problemNumber}
                  title={title}
                  difficulty={difficulty}
                  tags={tags}
                  navigate={navigate}
                />
                <ProblemDescription
                  description={description}
                  inputFormat={inputFormat}
                  outputFormat={outputFormat}
                  constraints={constraints}
                  visibleTestCases={visibleTestCases}
                />
              </>
            )}

            {activeTab === "submissions" && (
              <p className="text-gray-400 italic">
                Submissions view coming soon.
              </p>
            )}
          </div>
        </div>

        {/* DRAG HANDLE */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize bg-gray-700 hover:bg-purple-500 transition"
        ></div>

        {/* RIGHT PANEL */}
        <div
          className="flex flex-col bg-gray-950 min-w-[30vw]"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div style={{ height: `${editorHeight}%` }}>
            <CodeEditorPanel
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCodeMap={setCodeMap}
              customInput={customInput}
              setCustomInput={setCustomInput}
              isMobile={false}
            />
          </div>
          {/* DRAG HANDLE for height */}
          <div
            // Height drag will be handled later
            className="h-2 bg-gray-700"
          ></div>

          {/* Custom Test Case Area */}
          
            <div
              className="bg-gray-900 p-4 text-sm flex flex-col gap-2 overflow-hidden hide-scrollbar"
              style={{ height: `${testcaseHeight}%`, minHeight: "180px" }}
            >
              <h3 className="text-purple-400 font-semibold mb-1">
                Custom Test Case
              </h3>
              <textarea
                className="bg-gray-800 text-white p-2 rounded resize-none h-full hide-scrollbar"
                placeholder="Enter input here..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              ></textarea>
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailsPage;
