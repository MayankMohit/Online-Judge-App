import { ArrowLeft, ArrowBigUp } from "lucide-react";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputTab from "./OutputTab";

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
  lastAction,
  isOutputVisible,
  setIsOutputVisible,
}) => {
  return (
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
            <button
              className={`text-sm px-2 py-1 rounded ${
                activeTab === "description"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-700 text-purple-300"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`text-sm px-2 py-1 rounded ${
                activeTab === "submissions"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-700 text-purple-300"
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
      <div className="min-w-full h-full flex flex-col bg-gray-950 relative">
        <CodeEditorPanel
          language={language}
          setLanguage={setLanguage}
          code={code}
          customInput={customInput}
          setCustomInput={setCustomInput}
          onBackToDescription={() =>
            mobileScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" })
          }
          isMobile={true}
          onRun={handleRun}
          onSubmit={handleSubmit}
          currentProblem={currentProblem}
        />

        {/* Custom Test Case Area */}
        <div className="bg-gray-900 p-4 text-sm flex flex-col gap-2">
          <h3 className="text-purple-400 font-semibold mb-1">
            Custom Test Case
            <ArrowBigUp size={30} className="inline-block ml-2" />
          </h3>
          <textarea
            className="bg-gray-800 text-white p-2 rounded resize-none min-h-[100px] hide-scrollbar"
            placeholder="Enter input here..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          ></textarea>
        </div>

        {/* Output Drawer */}
        <div
          className={`fixed bottom-0 left-0 w-full bg-gray-900 shadow-lg transform transition-transform duration-300 ${
            isOutputVisible ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "45vh" }}
        >
          <div className="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <h3 className="text-purple-400 text-sm font-semibold">Output</h3>
            <button
              onClick={() => setIsOutputVisible(false)}
              className="text-gray-300 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
          <div className="p-3 overflow-auto max-h-[calc(45vh-40px)] text-sm">
            <OutputTab
              output={output}
              error={codeError}
              verdict={verdict}
              failedCase={failedCase}
              time={time || averageTime}
              loading={loading}
              lastAction={lastAction}
            />
          </div>
        </div>

        {/* Reopen Output Button */}
        {!isOutputVisible && (
          <button
            onClick={() => setIsOutputVisible(true)}
            className="fixed bottom-4 right-4 bg-purple-800 text-white px-2 py-1 rounded-lg shadow-lg text-sm"
          >
            Output
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileProblemView;
