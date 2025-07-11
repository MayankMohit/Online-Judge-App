import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ArrowLeft } from "lucide-react";
import {
  fetchProblemByNumber,
  clearCurrentProblem,
} from "../features/problems/problemsSlice";

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
  python: `# Write your code here
def main():
    pass

if __name__ == "__main__":
    main()`,
  javascript: `// Write your code here
function main() {
    
}

main();`,
};

const ProblemDetailsPage = () => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProblem, problemLoading, problemError } = useSelector(
    (state) => state.problems
  );

  const [leftWidth, setLeftWidth] = useState(35);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [activeTab, setActiveTab] = useState("description");
  const [editorHeight, setEditorHeight] = useState(70);
  const [testcaseHeight, setTestcaseHeight] = useState(30);
  const isDraggingHeight = useRef(false);
  const [customInput, setCustomInput] = useState("");
  const [language, setLanguage] = useState("cpp");

  // Boilerplate code for each language
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
      const newLeftWidth = Math.min(
        Math.max((offsetX / containerWidth) * 100, 30),
        70
      );
      setLeftWidth(newLeftWidth);
    }
    if (isDraggingHeight.current && containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const offsetY =
        e.clientY - containerRef.current.getBoundingClientRect().top;
      const newEditorHeight = Math.min(
        Math.max((offsetY / containerHeight) * 100, 20),
        95
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

  const difficultyColor =
    {
      Easy: "text-green-400 bg-green-950",
      Medium: "text-yellow-400 bg-yellow-950",
      Hard: "text-red-400 bg-red-950",
    }[difficulty] || "text-gray-400 bg-gray-700";

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex bg-gray-900 text-white overflow-hidden"
    >
      {/* LEFT PANEL */}
      <div
        className="h-full flex flex-col border-r border-gray-800 min-w-[35vw] hide-scrollbar"
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
            <button
              className={`px-3 rounded text-sm font-medium transition-colors ${
                activeTab === "description"
                  ? "bg-purple-900 text-gray-300 py-1.5"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`px-3 rounded text-sm font-medium transition-colors ${
                activeTab === "submissions"
                  ? "bg-purple-900 text-gray-300 py-1.5"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
          </div>
        </div>

        {/* Problem Content */}
        <div className="p-6 overflow-y-auto text-sm hide-scrollbar">
          {activeTab === "description" && (
            <>
              <h1 className="text-2xl font-bold mb-2">
                {problemNumber}. {title}
              </h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className={`px-2 py-1 rounded ${difficultyColor}`}>
                  {difficulty}
                </span>
                {tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-gray-300 font-semibold ml-2">
                      Topics:
                    </span>
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
              <div className="text-gray-300 whitespace-pre-wrap mb-4 text-lg">
                {description}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Input Format</h3>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {inputFormat}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Output Format</h3>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {outputFormat}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Constraints</h3>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {constraints}
                </p>
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Sample Input Output
              </h2>
              {visibleTestCases?.length ? (
                visibleTestCases.map((tc, i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded mb-4">
                    <p className="mb-1">
                      <span className="text-purple-400 font-medium">
                        Input:
                      </span>
                      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
                        {tc.input}
                      </pre>
                    </p>
                    <p>
                      <span className="text-purple-400 font-medium">
                        Output:
                      </span>
                      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
                        {tc.expectedOutput}
                      </pre>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No sample input/output.</p>
              )}
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
        className="h-full flex flex-col bg-gray-950 min-w-[35vw]"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <select
            className="bg-gray-900 text-white px-3 py-2 rounded text-sm focus-outline-none"
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
            }}
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          <div className="flex gap-3 mx-auto">
            <button className="bg-blue-800 px-4 py-1.5 text-purple-300 rounded hover:bg-blue-700 text-sm opacity-80">
              Run
            </button>
            <button className="bg-green-800 px-4 py-1.5 text-gray-200 rounded hover:bg-green-700 text-sm opacity-80">
              Submit
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <Editor
          height={`${editorHeight}%`}
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

        {/* DRAG HANDLE for height */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingHeight.current = true;
            document.body.style.cursor = "row-resize";
          }}
          className="h-2 cursor-row-resize bg-gray-700 hover:bg-purple-500 transition"
        ></div>

        {/* Custom Test Case Area */}
        <div
          className="bg-gray-900 p-4 text-sm flex flex-col gap-2 overflow-hidden hide-scrollbar"
          style={{ height: `${testcaseHeight}%`, minHeight: "150px" }}
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
  );
};

export default ProblemDetailsPage;
