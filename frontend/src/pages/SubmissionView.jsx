import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProblemHeader from "../components/ProblemPageComps/ProblemHeader";
import { fetchSubmissionById } from "../features/submissions/submissionsSlice";
import Editor from "@monaco-editor/react";
import LoadingScreen from "../components/LoadingScreen";
import { ArrowLeft } from "lucide-react";

const languageMap = {
  cpp: "C++",
  c: "C",
  py: "Python",
  js: "Javascript",
};

const SubmissionViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentSubmission, loading, error } = useSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    dispatch(fetchSubmissionById(id));
  }, [dispatch, id]);

  if (loading)
    return (
      <div className="text-center text-white mt-10">
        <LoadingScreen />
      </div>
    );
  if (error)
    return <div className="text-center text-red-400 mt-10">{error}</div>;
  if (!currentSubmission) return null;

  const { problem, code, language, verdict, averageTime, submittedAt, user } =
    currentSubmission;

  const readableLanguage = languageMap[language] || language;

  return (
    <div className="w-full flex flex-col items-center mt-2">
      {/* Back Button */}
      <div className="w-[98%] sm:w-[90%] mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-[98%] sm:w-[90%] text-white bg-gray-900 p-6 rounded-lg">
        {/* Top 30% – Problem Header */}
        <ProblemHeader
          problemNumber={problem.problemNumber}
          title={problem.title}
          difficulty={problem.difficulty}
          tags={problem.tags}
        />
        <p className="text-gray-300 mb-4">{problem.statement}</p>

        {/* Middle 50% – Code and Details */}
        <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
          {/* Left: Code */}
          <div className="w-full md:w-3/5 bg-gray-800 p-4 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Submitted Code</h2>
              <span className="px-2 py-1 font-semibold">
                {readableLanguage}
              </span>
            </div>
            <Editor
              height="90%"
              defaultLanguage={
                language === "py"
                  ? "python"
                  : language === "js"
                  ? "javascript"
                  : language
              }
              value={code}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Right: Submission Info */}
          <div className="w-full md:w-2/5 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Submission Details</h2>
            <p>
              <strong>User:</strong> {user?.name || "Anonymous"}
            </p>
            <p>
              <strong>Verdict:</strong>{" "}
              <span
                className={`font-bold ${
                  verdict === "accepted"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {verdict}
              </span>
            </p>
            <p>
              <strong>Avg Time:</strong> {averageTime}
            </p>
            <p>
              <strong>Submitted At:</strong>{" "}
              {new Date(submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewPage;
