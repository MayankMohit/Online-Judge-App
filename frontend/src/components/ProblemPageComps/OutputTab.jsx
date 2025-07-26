const OutputTab = ({
  output,
  error,
  verdict,
  failedCase,
  time,
  loading,
  lastAction,
  onClose,
}) => {
  const scrollBoxClasses =
    "bg-gray-800 p-1.5 rounded max-h-40 overflow-auto whitespace-pre-wrap text-gray-100 hide-scrollbar";

  const verdictMessage = {
    accepted: "Accepted, all test cases passed!",
    compilation_error: "Compilation Error!",
    wrong_answer: "Test Case Failed!",
    time_limit_exceeded: "Time Limit Exceeded!",
  };

  return (
    <div className="bg-gray-900 p-4 text-sm flex flex-col gap-2 h-full">
      {/* Close Button */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-purple-400 font-semibold">Output</h3>
        {onClose && (
          <button
            className="text-gray-400 hover:text-white text-xs"
            onClick={onClose}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Loader */}
      {lastAction === "run" && loading && (
        <div className="text-gray-400 italic">Running your code...</div>
      )}
      {lastAction === "submit" && loading && (
        <div className="text-gray-400 italic">
          Running your code with the test cases...
        </div>
      )}

      {/* Show Run Output */}
      {lastAction === "run" && !loading && (
        <div className={scrollBoxClasses}>
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <pre>{output || "No Output"}</pre>
          )}
        </div>
      )}

      {/* Show Submission Result */}
      {lastAction === "submit" && !loading && (
        <div className="space-y-3">
          {/* Verdict */}
          <p className="mb-1 text-xl">
            <span
              className={
                verdict === "accepted"
                  ? "text-green-400 font-semibold"
                  : "text-red-400 font-semibold"
              }
            >
              {verdictMessage[verdict] || "N/A"}
            </span>
          </p>

          {/* Compilation Error */}
          {verdict === "compilation_error" && (
            <div className={scrollBoxClasses}>
              <pre className="text-red-400">
                {failedCase?.actualOutput || error || "Compilation failed."}
              </pre>
            </div>
          )}

          {/* Wrong Answer Details */}
          {verdict === "wrong_answer" && (
            <div className="space-y-1">
              <div>
                <p className="text-purple-300">Input:</p>
                <div className={scrollBoxClasses}>
                  <pre>{failedCase?.input || "Not Available"}</pre>
                </div>
              </div>

              <div>
                <p className="text-green-400">Expected Output:</p>
                <div className={scrollBoxClasses}>
                  <pre>{failedCase?.expectedOutput || "Not Available"}</pre>
                </div>
              </div>

              <div>
                <p className="text-red-400">Your Output:</p>
                <div className={scrollBoxClasses}>
                  <pre>{failedCase?.actualOutput || "No Output"}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Time Limit Exceeded */}
          {verdict === "time_limit_exceeded" && error && (
            <div className={scrollBoxClasses}>
              <pre className="text-red-400">{error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OutputTab;
