import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchQuery,
  setFilters,
  fetchTags,
} from "../features/problems/problemsSlice";

const ProblemControls = ({ direction, setDirection }) => {
  const dispatch = useDispatch();
  const { searchQuery, filters } = useSelector((state) => state.problems);
  const { tags, tagsLoading, tagsError } = useSelector(
    (state) => state.problems
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

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

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (field, dir) => {
    dispatch(setFilters({ sort: `${field}_${dir}` }));
  };

  return (
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
              <div className="mb-4">
                <label className="block mb-1">Difficulty</label>
                <select
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                  onChange={(e) =>
                    dispatch(setFilters({ difficulty: e.target.value }))
                  }
                  value={filters.difficulty}
                >
                  <option value="">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 hide-scrollbar">
                  {tagsLoading ? (
                    <span className="text-gray-400 text-sm">Loading...</span>
                  ) : tagsError ? (
                    <span className="text-red-400 text-sm">{tagsError}</span>
                  ) : tags.length === 0 ? (
                    <span className="text-gray-400 text-sm">No tags</span>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = filters.tag.split(",").includes(tag);
                      return (
                        <button
                          key={tag}
                          className={`px-3 py-1 rounded-full text-xs transition capitalize ${
                            isSelected
                              ? "bg-purple-800 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                          onClick={() => {
                            const tagList = filters.tag
                              ? filters.tag.split(",").filter(Boolean)
                              : [];

                            const updated = isSelected
                              ? tagList.filter((t) => t !== tag)
                              : [...tagList, tag];

                            dispatch(setFilters({ tag: updated.join(",") }));
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })
                  )}
                </div>
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
                <li
                  onClick={() => {
                    handleSortChange("problemNumber", direction);
                    setDirection(direction === "desc" ? "asc" : "desc");
                  }}
                  className="hover:text-purple-300 cursor-pointer"
                >
                  From {direction === "desc" ? "last" : "first"}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemControls;
