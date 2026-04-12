import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubmissionById } from "../../features/submissions/submissionsSlice";
import Editor from "@monaco-editor/react";
import LoadingScreen from "../../components/LoadingScreen";
import { ArrowLeft, Clock, User, Code2, CheckCircle, XCircle } from "lucide-react";
import TopBar from "./TopBar";

const languageMap = { cpp: "C++", c: "C", py: "Python", js: "JavaScript" };
const monacoLang = { py: "python", js: "javascript", cpp: "cpp", c: "c" };

const verdictConfig = (verdict) => {
  switch (verdict) {
    case "accepted":            return { label: "Accepted",     cls: "text-green-400 bg-green-400/10 border-green-500/30", icon: <CheckCircle size={16} className="text-green-400" /> };
    case "wrong_answer":        return { label: "Wrong Answer", cls: "text-red-400 bg-red-400/10 border-red-500/30",   icon: <XCircle size={16} className="text-red-400" /> };
    case "time_limit_exceeded": return { label: "Time Limit Exceeded", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-500/30", icon: <Clock size={16} className="text-yellow-400" /> };
    case "compilation_error":   return { label: "Compilation Error", cls: "text-orange-400 bg-orange-400/10 border-orange-500/30", icon: <XCircle size={16} className="text-orange-400" /> };
    case "runtime_error":       return { label: "Runtime Error", cls: "text-pink-400 bg-pink-400/10 border-pink-500/30", icon: <XCircle size={16} className="text-pink-400" /> };
    default:                    return { label: verdict, cls: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: null };
  }
};

const difficultyColor = { Easy: "text-green-400", Medium: "text-yellow-400", Hard: "text-red-400" };

const SubmissionViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSubmission, currentLoading, currentError } = useSelector((state) => state.submissions);

  useEffect(() => {
    dispatch(fetchSubmissionById(id));
  }, [dispatch, id]);

  if (currentLoading) return <LoadingScreen />;
  if (currentError) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-400">{currentError}</div>
  );
  if (!currentSubmission) return null;

  const { problem, code, language, verdict, averageTime, submittedAt, user } = currentSubmission;
  const { label, cls, icon } = verdictConfig(verdict);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <TopBar
        title={`Submission`}
        onBack={() => navigate(-1)}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Problem info + verdict */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-zinc-500 text-sm">#{problem?.problemNumber}</span>
                <h2 className="text-lg font-bold text-white">{problem?.title}</h2>
                <span className={`text-xs font-semibold ${difficultyColor[problem?.difficulty]}`}>
                  {problem?.difficulty}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {problem?.tags?.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full border border-zinc-700 capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Verdict badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${cls} shrink-0`}>
              {icon}
              {label}
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <User size={14} className="text-purple-400" />, label: "User", value: user?.name || "Anonymous" },
            { icon: <Code2 size={14} className="text-blue-400" />, label: "Language", value: languageMap[language] || language },
            { icon: <Clock size={14} className="text-yellow-400" />, label: "Avg Time", value: `${averageTime}ms` },
            { icon: <Clock size={14} className="text-zinc-400" />, label: "Submitted", value: new Date(submittedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">{icon}{label}</div>
              <p className="text-sm font-medium text-white truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Code editor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Submitted Code</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono uppercase">{languageMap[language] || language}</span>
          </div>
          <div className="h-[55vh]">
            <Editor
              height="100%"
              defaultLanguage={monacoLang[language] || language}
              value={code}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewPage;