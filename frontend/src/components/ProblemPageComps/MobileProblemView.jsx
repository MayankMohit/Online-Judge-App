import { ArrowLeft, ArrowBigUp } from "lucide-react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";

const MobileProblemView = ({
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
  setCodeMap,
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
  mobileScrollRef,
}) => {
  return (
    <div className="flex flex-row md:hidden w-full h-full overflow-x-hidden scroll-smooth" ref={mobileScrollRef}>
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
            <button
              className={`text-sm px-2 py-1 rounded ${
                activeTab === "description" ? "bg-purple-700 text-white" : "bg-gray-700 text-purple-300"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`text-sm px-2 py-1 rounded ${
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

      {/* Code Editor Panel (mobile) */}
      <div className="min-w-full h-full flex flex-col bg-gray-950">
        <CodeEditorPanel
          language={language}
          setLanguage={setLanguage}
          code={code}
          setCodeMap={setCodeMap}
          customInput={customInput}
          setCustomInput={setCustomInput}
          onBackToDescription={() =>
            mobileScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" })
          }
          isMobile={true}
          onRun={handleRun}
          onSubmit={handleSubmit}
        />

        {/* Custom Test Case Area (mobile) */}
        <div className="bg-gray-900 p-4 min-h-40 text-sm flex flex-col gap-2 overflow-hidden hide-scrollbar">
          <h3 className="text-purple-400 font-semibold mb-1">
            Custom Test Case <ArrowBigUp size={30} className="inline-block ml-2" />
          </h3>
          <textarea
            className="bg-gray-800 text-white p-2 rounded resize-none h-full hide-scrollbar"
            placeholder="Enter input here..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          ></textarea>
        </div>

        {/* Output Display (mobile) */}
        <div className="px-4 pb-4 text-sm">
          {codeError ? (
            <p className="text-red-500 text-sm">Error: {codeError}</p>
          ) : output ? (
            <div className="text-sm">
              <p>
                <span className="text-purple-400">Output:</span>
                <pre className="bg-gray-800 rounded p-2 mt-1 whitespace-pre-wrap">{output}</pre>
              </p>
              {time && (
                <p className="text-gray-400 mt-1 text-xs">Execution Time: {time}ms</p>
              )}
            </div>
          ) : verdict && (
            <div className="mt-2 text-sm">
              <p>
                <span className="text-purple-400">Verdict:</span>{" "}
                <span className={verdict === "accepted" ? "text-green-400" : "text-red-400"}>
                  {verdict}
                </span>
              </p>
              {failedCase && (
                <div className="mt-1 text-xs text-red-400">
                  Failed on input:
                  <pre className="whitespace-pre-wrap">{failedCase.input}</pre>
                </div>
              )}
              {averageTime && (
                <p className="text-gray-400 mt-1 text-xs">Avg Time: {averageTime}ms</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileProblemView;
