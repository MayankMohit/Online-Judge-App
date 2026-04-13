import { ArrowLeft } from "lucide-react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";
import TestCasePanel from "./TestCasePanel";

const MobileProblemView = ({
  activeTab, setActiveTab, currentProblem, userSubmissions,
  loading, error, navigate, isSolved, language, setLanguage,
  code, handleRun, handleSubmit, handleCodeChange,
  verdict, failedCase, averageTime, lastAction,
  testCases, setTestCases, activeTestCaseIdx, setActiveTestCaseIdx,
  testCaseResults, isOutputMode, setIsOutputMode,
  mobileScrollRef,
}) => {
  const isSubmitResult = lastAction === "submit" && !loading && verdict;
  const showDrawer = isOutputMode || isSubmitResult;

  return (
    <div
      className="flex flex-row md:hidden w-full h-full overflow-x-hidden scroll-smooth"
      ref={mobileScrollRef}
    >
      {/* DESCRIPTION PANEL */}
      <div className="min-w-full h-full flex flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
            </button>
            {["description", "submissions"].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  activeTab === tab ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsOutputMode(false);
              mobileScrollRef.current?.scrollTo({ left: window.innerWidth, behavior: "smooth" });
            }}
            className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-700 transition"
          >
            Code →
          </button>
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

      {/* CODE PANEL */}
      <div className="min-w-full h-full flex flex-col bg-zinc-950 relative">
        <CodeEditorPanel
          language={language}
          setLanguage={setLanguage}
          code={code}
          handleCodeChange={handleCodeChange}
          onBackToDescription={() => {
            setIsOutputMode(false);
            mobileScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
          }}
          isMobile={true}
          onRun={() => handleRun()}
          onSubmit={() => handleSubmit()}
          currentProblem={currentProblem}
        />

        {/* Test case strip (always visible below editor on mobile) */}
        <div className="bg-zinc-900 border-t border-zinc-800 shrink-0" style={{ height: "200px" }}>
          {isSubmitResult ? (
            <OutputTab
              verdict={verdict}
              failedCase={failedCase}
              averageTime={averageTime}
              lastAction={lastAction}
              loading={loading}
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

export default MobileProblemView;