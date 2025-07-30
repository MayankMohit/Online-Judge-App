import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSubmissions } from "../../features/submissions/submissionsSlice";
import SubmissionsPage from "../../components/SubmissionsPage";
import { ArrowLeft } from "lucide-react";

export default function AllSubmissions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.submissions);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchSubmissions());
  }, [dispatch]);

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
      <SubmissionsPage submissions={items} loading={loading} error={error} />
    </div>
  );
}
