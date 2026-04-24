import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../features/favorites/favoritesSlice";

const ProblemCard = ({ problem, index, dashboard=false }) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isGuest = !isAuthenticated || !user;

  const favoriteProblemIds = useSelector((state) => state.favorites.favoriteProblemIds);

  const isSolved = isGuest ? false : user?.solvedProblems?.some(
    (entry) => entry.problemId === problem._id && entry.status === "accepted"
  );

  const reduxIsFavorite = isGuest ? false : favoriteProblemIds.includes(problem._id);

  // Optimistic local state — null means "follow Redux", true/false means "user just clicked"
  const [optimisticFavorite, setOptimisticFavorite] = useState(null);
  const isFavorite = optimisticFavorite !== null ? optimisticFavorite : reduxIsFavorite;

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isGuest) return;

    const next = !isFavorite;
    setOptimisticFavorite(next);

    const action = next ? addFavorite(problem._id) : removeFavorite(problem._id);
    dispatch(action)
      .unwrap()
      .then(() => {
        // Redux is now in sync — clear optimistic override
        setOptimisticFavorite(null);
      })
      .catch(() => {
        // Revert on failure
        setOptimisticFavorite(!next);
      });
  };

  const difficultyConfig = {
    Easy:   { text: "text-green-400",  border: "border-l-green-400",  bg: "bg-green-400/10"  },
    Medium: { text: "text-yellow-400", border: "border-l-yellow-400", bg: "bg-yellow-400/10" },
    Hard:   { text: "text-red-400",    border: "border-l-red-400",    bg: "bg-red-400/10"    },
  }[problem.difficulty] || { text: "text-gray-400", border: "border-l-gray-400", bg: "" };

  const visibleTagsDesktop = problem.tags?.slice(0, 3) || [];
  const visibleTagsMobile = problem.tags?.slice(0, 1) || [];
  const extraDesktop = (problem.tags?.length || 0) - visibleTagsDesktop.length;
  const extraMobile = (problem.tags?.length || 0) - visibleTagsMobile.length;

  return (
    <div
      onClick={() => navigate(`/problems/${problem.problemNumber}`)}
      className={`${dashboard ? "w-full" : "w-[93vw] sm:w-full"} overflow-hidden bg-zinc-900 border border-zinc-800 border-l-4 ${difficultyConfig.border} p-3 rounded-lg shadow-md hover:bg-zinc-800 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2`}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isSolved ? (
          <CheckCircle size={16} className="text-green-400 shrink-0" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-zinc-600 shrink-0" />
        )}
        <span className="text-zinc-500 text-sm shrink-0">#{index}</span>
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{problem.title}</h3>
          {problem.tags?.length > 0 && (
            <div className="flex gap-1 mt-1">
              <div className="flex gap-1 sm:hidden">
                {visibleTagsMobile.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full capitalize">{tag}</span>
                ))}
                {extraMobile > 0 && <span className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-xs rounded-full">+{extraMobile}</span>}
              </div>
              <div className="hidden sm:flex gap-1">
                {visibleTagsDesktop.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full capitalize">{tag}</span>
                ))}
                {extraDesktop > 0 && <span className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-xs rounded-full">+{extraDesktop}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full ${difficultyConfig.text} ${difficultyConfig.bg}`}>
          {problem.difficulty}
        </span>
        {!isGuest && (
          <button onClick={handleFavorite} className="hover:scale-110 transition-transform">
            <Star
              size={18}
              className={`transition-colors duration-150 ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-500 hover:text-yellow-400"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;