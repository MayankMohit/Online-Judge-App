import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";
import TestCasePanel from "./TestCasePanel";
import { useAuthStore } from "../../store/authStore";

const MobileProblemView = ({
  activeTab, setActiveTab, currentProblem, userSubmissions,
  loading, error, navigate, isSolved, language, setLanguage,
  code, handleRun, handleSubmit, handleCodeChange,
  verdict, failedCase, averageTime, lastAction,
  testCases, setTestCases, activeTestCaseIdx, setActiveTestCaseIdx,
  testCaseResults, isOutputMode, setIsOutputMode,
  mobileScrollRef,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const isGuest = !isAuthenticated || !user;
  const isSubmitResult = lastAction === "submit" && !loading && verdict;

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
            {["description","hints", ...(isGuest ? [] : ["submissions"])].map((tab) => (
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
          {/* Only show Code → button if logged in */}
          {!isGuest && (
            <button
              onClick={() => {
                setIsOutputMode(false);
                mobileScrollRef.current?.scrollTo({ left: window.innerWidth, behavior: "smooth" });
              }}
              className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-700 transition"
            >
              Code →
            </button>
          )}
          {/* Guest: show Sign in button */}
          {isGuest && (
            <Link
              to="/login"
              className="text-xs text-purple-300 bg-purple-600/20 border border-purple-500/30 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 transition"
            >
              Sign in
            </Link>
          )}
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

      {/* CODE PANEL — only rendered for logged-in users */}
      {!isGuest && (
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
      )}

      {/* GUEST — locked code panel shown on mobile scroll */}
      {isGuest && (
        <div className="min-w-full h-full flex flex-col items-center justify-center bg-zinc-950 gap-5 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Lock size={28} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Log in to start coding</h3>
            <p className="text-zinc-400 text-sm">
              Sign in to access the code editor, run your code, and submit solutions.
            </p>
          </div>
          <div className="flex gap-3">
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
      )}
    </div>
  );
};

export default MobileProblemView;