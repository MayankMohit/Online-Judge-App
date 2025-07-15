import ProblemHeader from "./ProblemHeader";
import ProblemDescription from "./ProblemDescription";

const ProblemDescriptionPanel = ({
  activeTab,
  setActiveTab,
  problem,
  submissions,
  loading,
  error,
  navigate,
  isSolved,
}) => {
  const {
    problemNumber,
    title,
    difficulty,
    tags,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    testCases,
  } = problem;

  const visibleTestCases = testCases?.filter((tc) => !tc.isHidden)?.slice(0, 2);

  return (
    <div className="overflow-y-auto p-4 text-sm hide-scrollbar sm:p-6">

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
          />
        </>
      )}

      {activeTab === "submissions" && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-purple-300 font-semibold text-lg mb-2">Your Submissions</h3>

          {loading ? (
            <p className="text-gray-400">Loading your submissions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-500">No submissions yet for this problem.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-700 text-purple-200">
                    <th className="py-2 pl-4">Language</th>
                    <th className="py-2 pl-4">Verdict</th>
                    <th className="py-2 pl-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-2 pl-4">{sub.language}</td>
                      <td className={`py-2 pl-4 font-semibold ${sub.verdict === "accepted" ? "text-green-400" : "text-red-400"}`}>
                        {sub.verdict}
                      </td>
                      <td className="py-2 pl-4">
                        {new Date(sub.submittedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemDescriptionPanel;
