import { useParams, useNavigate } from "react-router-dom";
import SubmissionsPage from "../../components/SubmissionsPage";
import { useUserSubmissionsForAdmin } from "../../hooks/adminHooks/useUserSubmissionsForAdmin";
import { ArrowLeft } from "lucide-react";
import TopBar from "./TopBar";

export default function AllSubmissionsOfUser() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { submissions, loading, error } =
    useUserSubmissionsForAdmin(userId);

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
      />
    </div>
  );
}