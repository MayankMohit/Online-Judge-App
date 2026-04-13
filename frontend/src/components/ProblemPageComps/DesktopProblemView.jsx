import { useRef } from "react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";
import TestCasePanel from "./TestCasePanel";
import { ArrowLeft } from "lucide-react";

const DesktopProblemView = ({
  activeTab, setActiveTab, currentProblem, userSubmissions,
  loading, error, navigate, isSolved, language, setLanguage,
  code, handleRun, handleSubmit, handleCodeChange,
  verdict, failedCase, averageTime, lastAction,
  testCases, setTestCases, activeTestCaseIdx, setActiveTestCaseIdx,
  testCaseResults, isOutputMode, setIsOutputMode,
  editorHeight, testcaseHeight, setEditorHeight, setTestcaseHeight,
  containerRef, leftWidth, setLeftWidth,
}) => {
  const isDraggingRef = useRef(false);
  const isDraggingHeight = useRef(false);

  const handleMouseMove = (e) => {
    if (isDraggingRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const offsetX = e.clientX - containerRef.current.getBoundingClientRect().left;
      const newLeftWidth = Math.min(Math.max((offsetX / containerWidth) * 100, 15), 85);
      setLeftWidth(newLeftWidth);
    }
    if (isDraggingHeight.current && containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const offsetY = e.clientY - containerRef.current.getBoundingClientRect().top;
      const newEditorHeight = Math.min(Math.max((offsetY / containerHeight) * 100, 25), 85);
      setEditorHeight(newEditorHeight);
      setTestcaseHeight(100 - newEditorHeight);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isDraggingHeight.current = false;
    document.body.style.cursor = "default";
  };

  const isSubmitResult = lastAction === "submit" && !loading && verdict;

  return (
    <div
      className="hidden md:flex w-full h-full bg-zinc-950"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* LEFT PANEL */}
      <div className="h-full flex flex-col border-r border-zinc-800 min-w-[20vw] bg-zinc-950" style={{ width: `${leftWidth}%` }}>
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition mr-1"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
          </button>
          {["description", "submissions"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                activeTab === tab ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <ProblemDescriptionPanel
          activeTab={activeTab}
          problem={currentProblem}
          submissions={userSubmissions}
          loading={loading}
          error={error}
          navigate={navigate}
          isSolved={isSolved}
        />
      </div>

      {/* VERTICAL DRAG HANDLE */}
      <div
        onMouseDown={(e) => { e.preventDefault(); isDraggingRef.current = true; document.body.style.cursor = "col-resize"; }}
        className="w-1 cursor-col-resize bg-zinc-800 hover:bg-purple-600 transition-colors shrink-0"
      />

      {/* RIGHT PANEL */}
      <div className="flex flex-col bg-zinc-950 min-w-[20vw]" style={{ width: `${100 - leftWidth}%` }}>
        {/* Editor */}
        <div style={{ height: `${editorHeight}%` }}>
          <CodeEditorPanel
            language={language}
            setLanguage={setLanguage}
            code={code}
            isMobile={false}
            onRun={handleRun}
            onSubmit={handleSubmit}
            currentProblem={currentProblem}
            handleCodeChange={handleCodeChange}
          />
        </div>

        {/* HORIZONTAL DRAG HANDLE */}
        <div
          className="h-1 bg-zinc-800 hover:bg-purple-600 cursor-row-resize transition-colors shrink-0"
          onMouseDown={(e) => { e.preventDefault(); isDraggingHeight.current = true; document.body.style.cursor = "row-resize"; }}
        />

        {/* BOTTOM PANEL — test cases OR submit result */}
        <div className="flex-1 overflow-hidden" style={{ height: `${testcaseHeight}%`, minHeight: "160px" }}>
          {isSubmitResult ? (
            <OutputTab
              verdict={verdict}
              failedCase={failedCase}
              averageTime={averageTime}
              lastAction={lastAction}
              loading={loading}
              onClose={() => setIsOutputMode(false)}
            />
          ) : (
            <TestCasePanel
              testCases={testCases}
              activeIdx={activeTestCaseIdx}
              setActiveIdx={setActiveTestCaseIdx}
              onTestCasesChange={setTestCases}
              results={testCaseResults}
              loading={loading && lastAction === "runAll"}
              isOutputMode={isOutputMode}
              setIsOutputMode={setIsOutputMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopProblemView;