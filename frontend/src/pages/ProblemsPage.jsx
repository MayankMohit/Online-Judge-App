import { useState, useRef, useEffect, useCallback } from "react";
import ProblemCard from "../components/ProblemCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteProblems } from "../features/favorites/favoritesSlice";
import ProblemControls from "../components/ProblemControls";
import {
  fetchProblems,
  incrementPage,
} from "../features/problems/problemsSlice";

const ProblemsPage = () => {
  const observer = useRef();
  const [direction, setDirection] = useState("desc");
  const dispatch = useDispatch();
  const { items, loading, error, hasMore, page, searchQuery, filters } = useSelector((state) => state.problems);

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch, page, searchQuery, filters]);

  useEffect(() => {
    dispatch(fetchFavoriteProblems());
  }, [dispatch, page]);

  const lastProblemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(incrementPage());
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, dispatch]
  );

  return (
    <div className="bg-gray-900 text-white px-6 py-25 sm:py-20 min-h-[calc(100vh-8rem)] relative min-w-screen select-none">
      <ProblemControls direction={direction} setDirection={setDirection} />

      {/* Problem List */}
      <div className="grid gap-2 md:px-50">
        {loading && (
          <div className="w-6 h-6 m-auto rounded-full border-2 border-t-purple-500 border-b-purple-300 animate-spin"></div>
        )}
        {error && <p className="text-red-500 m-auto">Error: {error}</p>}

        {items.map((problem, index) => {
          const refProps =
            index === items.length - 1 ? { ref: lastProblemRef } : {};
          return (
            <div key={problem._id} {...refProps}>
              <ProblemCard problem={problem} index={problem.problemNumber} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProblemsPage;
