import { useRef } from "react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";
import TestCasePanel from "./TestCasePanel";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

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
  const { isAuthenticated, user } = useAuthStore();
  const isGuest = !isAuthenticated || !user;

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
      {/* LEFT PANEL — always visible */}
      <div className="h-full flex flex-col border-r border-zinc-800 min-w-[20vw] bg-zinc-950" style={{ width: `${leftWidth}%` }}>
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition mr-1"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
          </button>
          {["description", ...(isGuest ? [] : ["hints", "submissions"])].map((tab) => (
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
          setActiveTab={setActiveTab}
          problem={currentProblem}
          submissions={userSubmissions}
          loading={loading}
          error={error}
          navigate={navigate}
          isSolved={isSolved}
          isGuest={isGuest}
        />
      </div>

      {/* VERTICAL DRAG HANDLE */}
      <div
        onMouseDown={(e) => { e.preventDefault(); isDraggingRef.current = true; document.body.style.cursor = "col-resize"; }}
        className="w-1 cursor-col-resize bg-zinc-800 hover:bg-purple-600 transition-colors shrink-0"
      />

      {/* RIGHT PANEL — blurred for guests */}
      <div className="flex flex-col bg-zinc-950 min-w-[20vw] relative" style={{ width: `${100 - leftWidth}%` }}>

        {/* Guest overlay — blurs everything and shows login prompt */}
        {isGuest && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-zinc-950/60 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Lock size={24} className="text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Log in to start coding</h3>
              <p className="text-zinc-400 text-sm max-w-xs">
                Sign in to access the code editor, run your code, and submit solutions.
              </p>
              <div className="flex gap-3 mt-1">
                <Link
                  to="/login"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Editor — underneath overlay for guests */}
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
            disabled={isGuest}
          />
        </div>

        {/* HORIZONTAL DRAG HANDLE */}
        <div
          className="h-1 bg-zinc-800 hover:bg-purple-600 cursor-row-resize transition-colors shrink-0"
          onMouseDown={(e) => { e.preventDefault(); isDraggingHeight.current = true; document.body.style.cursor = "row-resize"; }}
        />

        {/* BOTTOM PANEL */}
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