import { useState, useRef, useEffect, useCallback } from "react";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";
import ProblemCard from "../components/ProblemCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteProblems } from "../features/favorites/favoritesSlice";

import {
  fetchProblems,
  setSearchQuery,
  setFilters,
  incrementPage,
} from "../features/problems/problemsSlice";

const ProblemsPage = () => {
  const [tagInput, setTagInput] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const observer = useRef();
  const [direction, setDirection] = useState("desc"); 

  const { loading: loadingFavorites } = useSelector((state) => state.favorites);

  const dispatch = useDispatch();
  const {
    items,
    loading,
    error,
    hasMore,
    page,
    searchQuery,
    filters,
  } = useSelector((state) => state.problems);

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch, page, searchQuery, filters]);

  useEffect(() => {
    dispatch(fetchFavoriteProblems());
  }, [dispatch, page])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (field, direction) => {
    dispatch(setFilters({ sort: `${field}_${direction}` }));
  };

  return (
    <div className="bg-gray-900 text-white px-6 py-25 sm:py-20 min-h-[calc(100vh-8rem)] relative min-w-screen select-none">
      {/* Top Controls */}
      <div className="flex flex-row gap-2 items-center sm:justify-center mb-6">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search problems..."
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 z-10"
        />

        {/* Filter & Sort */}
        <div className="flex gap-1">
          {/* Filter */}
          <div className="relative z-20" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
            >
              <SlidersHorizontal size={16} />
            </button>
            {filterOpen && (
              <div className="absolute mt-2 -ml-40 bg-gray-800 p-4 rounded-lg shadow-lg w-64 z-20">
                <h4 className="text-purple-400 font-semibold mb-2">Filter by:</h4>
                {/* <div className="mb-2">
                  <label className="block mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. array, dp"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      dispatch(setFilters({ tag: tagInput }));
                    
                    }}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
                  />
                </div> */}
                <div>
                  <label className="block mb-1">Difficulty</label>
                  <select
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                    onChange={(e) => dispatch(setFilters({ difficulty: e.target.value }))}
                    value={filters.difficulty}
                  >
                    <option value="">All</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative z-20" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
            >
              <ArrowDownUp size={16} />
            </button>
            {sortOpen && (
              <div className="absolute mt-2 -ml-30 bg-gray-800 p-4 rounded-lg shadow-lg w-40 z-20">
                <h4 className="text-purple-400 font-semibold mb-2">Sort by:</h4>
                <ul className="space-y-2 text-sm">
                  {/* <li className="hover:text-purple-300 cursor-pointer">Difficulty</li> */}
                  
                  <li onClick={() => {
                    handleSortChange("problemNumber", direction);
                    setDirection(direction === "desc" ? "asc" : "desc");
                  }} className="hover:text-purple-300 cursor-pointer">From { direction === "desc" ? "last" : "first"}</li>
                  {/* <li  className="hover:text-purple-300 cursor-pointer">Solved First</li>
                  <li  className="hover:text-purple-300 cursor-pointer">Unsolved First</li> */}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="grid gap-2 md:px-50">
        {(loading) && <div className="w-6 h-6 m-auto rounded-full border-2 border-t-purple-500 border-b-purple-300 animate-spin"></div>
}
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
  );
};

export default ProblemsPage;