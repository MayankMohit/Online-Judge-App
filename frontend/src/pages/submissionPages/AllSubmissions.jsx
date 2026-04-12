import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSubmissions } from "../../features/submissions/submissionsSlice";
import SubmissionsPage from "../../components/SubmissionsPage";
import { ArrowLeft } from "lucide-react";
import TopBar from "./TopBar";

export default function AllSubmissions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.submissions);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchSubmissions());
  }, [dispatch]);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TopBar
        title="All Submissions"
        onBack={() => navigate(-1)}
      />
      <SubmissionsPage submissions={items} loading={loading} error={error} heading="" />
    </div>
  );
}