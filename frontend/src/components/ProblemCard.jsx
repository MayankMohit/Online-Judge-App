import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProblemCard = ({ problem, index }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isSolved = user?.solvedProblems?.some(
    (entry) => entry.problemId === problem._id && entry.status === "accepted"
  );
  const isFavorite = user?.favorites?.includes(problem._id);

  const [fav, setFav] = useState(isFavorite);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setFav((prev) => !prev);
    // TODO: make API call to update fav in backend
  };

  const difficultyColor = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  }[problem.difficulty];

  return (
    <div
      onClick={() => navigate(`/problems/${problem._id}`)}
      className="bg-gray-800 p-3 rounded-lg shadow-md hover:bg-gray-700 transition cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${isSolved ? "bg-green-400" : "bg-gray-500"}`} />
        <span className="text-gray-400">#{index + 1}</span>
        <h3 className="text-lg font-semibold text-white sm:truncate sm:max-w-[clamp(8rem,40vw,28rem)] sm:overflow-hidden sm:whitespace-nowrap">{problem.title}</h3>
      </div>    

      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${difficultyColor}`}>{problem.difficulty}</span>
        <button onClick={handleFavorite}>
          <Star
            size={20}
            className={fav ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
          />
        </button>
      </div>
    </div>
  );
};

export default ProblemCard;
