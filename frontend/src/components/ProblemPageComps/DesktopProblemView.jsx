import { useRef } from "react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";
import { ArrowLeft } from "lucide-react";
import TabButton from "./TabButton";

const DesktopProblemView = ({
  activeTab,
  setActiveTab,
  currentProblem,
  userSubmissions,
  loading,
  error,
  navigate,
  isSolved,
  language,
  setLanguage,
  code,
  customInput,
  setCustomInput,
  handleRun,
  handleSubmit,
  output,
  codeError,
  verdict,
  failedCase,
  averageTime,
  time,
  isOutputVisible,
  setIsOutputVisible,
  editorHeight,
  testcaseHeight,
  setEditorHeight,
  setTestcaseHeight,
  containerRef,
  leftWidth,
  setLeftWidth,
}) => {
  const isDraggingRef = useRef(false);
  const isDraggingHeight = useRef(false);

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

      const minHeightPx = 100;
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

  return (
    <div
      className="hidden md:flex w-full h-full"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* LEFT PANEL */}
      <div
        className="h-full flex flex-col border-r border-gray-800 min-w-[25vw] hide-scrollbar"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </button>
            <button
              className={`text-sm px-2 py-2 rounded ${
                activeTab === "description" ? "bg-purple-700 text-white" : "bg-gray-700 text-purple-300"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`text-sm px-2 py-2 rounded ${
                activeTab === "submissions" ? "bg-purple-700 text-white" : "bg-gray-700 text-purple-300"
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
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
        <ProblemDescriptionPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          problem={currentProblem}
          submissions={userSubmissions}
          loading={loading}
          error={error}
          navigate={navigate}
          isSolved={isSolved}
        />
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
            customInput={customInput}
            setCustomInput={setCustomInput}
            isMobile={false}
            onRun={handleRun}
            onSubmit={handleSubmit}
            currentProblem={currentProblem}
          />
        </div>

        <div className="h-2 bg-gray-700"></div>

        {isOutputVisible ? (
          <OutputTab
            output={output}
            error={codeError}
            verdict={verdict}
            failedCase={failedCase}
            time={time}
            onClose={() => setIsOutputVisible(false)}
          />
        ) : (
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
            <button
              className="mt-2 text-purple-300 text-xs underline"
              onClick={() => setIsOutputVisible(true)}
            >
              Show Output Tab ↥
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopProblemView;