import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProblemSubmissionsForAdmin } from "../../hooks/adminHooks/useProblemSubmissionsForAdmin";
import SubmissionsPage from "../../components/SubmissionsPage";
import TopBar from "./TopBar";

export default function AllSubmissionsOfProblem() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const { submissions, loading, error } =
    useProblemSubmissionsForAdmin(problemId);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TopBar
        title="All Submissions"
        onBack={() => navigate(-1)}
      />

      <SubmissionsPage
        submissions={submissions}
        loading={loading}
        error={error}
        viewMode="problem"
      />
    </div>
  );
}