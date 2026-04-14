import { useState, useRef, useEffect, useCallback } from "react";
import ProblemCard from "../../components/ProblemCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteProblems } from "../../features/favorites/favoritesSlice";
import ProblemControls from "../../components/ProblemControls";
import { fetchProblems, incrementPage } from "../../features/problems/problemsSlice";
import { SearchX } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import LoadingScreen from "../../components/LoadingScreen";

const ProblemsPage = () => {
  const observer = useRef();
  const [direction, setDirection] = useState("desc");
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuthStore();
  const isGuest = !isAuthenticated || !user;

  const { items, loading, error, hasMore, page, searchQuery, filters } =
    useSelector((state) => state.problems);

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch, page, searchQuery, filters]);

  useEffect(() => {
    if (!isGuest) {
      dispatch(fetchFavoriteProblems());
    }
  }, [dispatch, page, isGuest]);

  const lastProblemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      let timeoutId;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => { dispatch(incrementPage()); }, 600);
          }
        },
        { rootMargin: "0px 0px 500px 0px" }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, dispatch]
  );

  const hasActiveFilters = searchQuery || filters.difficulty || filters.tag || filters.sort;

  return (
    // Removed min-w-screen — it forces the page wider than the viewport on mobile
    // Added overflow-x-hidden to prevent any child from causing horizontal scroll
    <div className="bg-black w-screen text-white px-4 sm:px-6 py-25 sm:py-20 min-h-[calc(100vh-8rem)] relative overflow-x-hidden select-none">

      {/* Shared max-width wrapper so controls + list are always aligned */}
      <div className="max-w-3xl mx-auto">
        <ProblemControls direction={direction} setDirection={setDirection} />

        {/* Problem count */}
        <div className="mb-3">
          {!loading && items.length > 0 && (
            <p className="text-zinc-500 text-xs">
              Showing <span className="text-zinc-300 font-medium">{items.length}</span> problems
              {!hasMore && " · All loaded"}
            </p>
          )}
        </div>

        {/* Problem list */}
        <div className="grid gap-2">
          {!loading && items.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchX size={48} className="text-zinc-600 mb-4" />
              <h3 className="text-zinc-300 font-semibold text-lg mb-1">No problems found</h3>
              <p className="text-zinc-500 text-sm">
                {hasActiveFilters ? "Try adjusting your search or filters" : "No problems available yet"}
              </p>
            </div>
          )}

          {error && <p className="text-red-500 m-auto">Error: {error}</p>}

          {items.map((problem, index) => {
            const refProps = index === items.length - 1 ? { ref: lastProblemRef } : {};
            return (
              <div key={problem._id} {...refProps}>
                <ProblemCard problem={problem} index={problem.problemNumber} />
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;