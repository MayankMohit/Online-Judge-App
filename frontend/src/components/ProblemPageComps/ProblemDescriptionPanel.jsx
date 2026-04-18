import { useNavigate } from "react-router-dom";
import ProblemHeader from "./ProblemHeader";
import ProblemDescription from "./ProblemDescription";
import HintPanel from "./HintPanel";

const verdictLabel = (v) =>
  ({ accepted: "Accepted", wrong_answer: "Wrong Answer", time_limit_exceeded: "TLE", compilation_error: "Compilation Error", runtime_error: "Runtime Error" }[v] || v);

const verdictColor = (v) => v === "accepted" ? "text-green-400" : "text-red-400";

const ProblemDescriptionPanel = ({ activeTab, setActiveTab, problem, submissions, loading, error, navigate, isSolved, isGuest }) => {
  const { problemNumber, title, difficulty, tags, statement, inputFormat, outputFormat, constraints, testCases } = problem;
  const nav = useNavigate();
  const visibleTestCases = testCases?.filter((tc) => !tc.isHidden)?.slice(0, 2);

  return (
    <div className="overflow-y-auto flex-1 px-4 py-4 hide-scrollbar sm:px-5">
      {activeTab === "description" && (
        <>
          <ProblemHeader
            problemNumber={problemNumber}
            title={title}
            difficulty={difficulty}
            tags={tags}
            navigate={navigate}
            isSolved={isSolved}
          />
          <ProblemDescription
            description={statement}
            inputFormat={inputFormat}
            outputFormat={outputFormat}
            constraints={constraints}
            visibleTestCases={visibleTestCases}
            problem={problem}
            isGuest={isGuest}
          />
        </>
      )}

      {activeTab === "hints" && (
        <HintPanel problem={problem} isGuest={isGuest} />
      )}

      {activeTab === "submissions" && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Your Submissions</h3>
          {loading ? (
            <p className="text-zinc-500 text-sm">Loading...</p>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-zinc-600 text-sm italic">No submissions yet for this problem.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {submissions.map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  className="flex items-center justify-between px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition"
                  onClick={() => nav(`/submissions/${sub._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500 uppercase">{sub.language}</span>
                    <span className={`text-xs font-semibold ${verdictColor(sub.verdict)}`}>
                      {verdictLabel(sub.verdict)}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600">
                    {new Date(sub.submittedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemDescriptionPanel;