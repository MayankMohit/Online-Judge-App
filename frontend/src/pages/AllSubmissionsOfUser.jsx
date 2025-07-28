import { useParams, useNavigate } from "react-router-dom";
import SubmissionsPage from "../components/SubmissionsPage";
import { useUserSubmissionsForAdmin } from "../hooks/adminHooks/useUserSubmissionsForAdmin";
import { ArrowLeft } from "lucide-react";

export default function AllSubmissionsOfUser() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { submissions, loading, error } = useUserSubmissionsForAdmin(userId);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Back Button */}
      <div className="fixed top-5 left-10 z-50 rounded-md bg-gray-700 px-2 py-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Submissions List */}
      <SubmissionsPage
        submissions={submissions}
        loading={loading}
        error={error}
      />
    </div>
  );
}
