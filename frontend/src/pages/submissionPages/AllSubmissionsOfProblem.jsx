import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProblemSubmissionsForAdmin } from "../../hooks/adminHooks/useProblemSubmissionsForAdmin";
import SubmissionsPage from "../../components/SubmissionsPage";

export default function AllSubmissionsOfProblem() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const { submissions, loading, error } = useProblemSubmissionsForAdmin(problemId);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="fixed top-5 left-10 z-50 rounded-md bg-gray-700 px-2 py-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <SubmissionsPage
        submissions={submissions}
        loading={loading}
        error={error}
        viewMode="problem"
      />
    </div>
  );
}
