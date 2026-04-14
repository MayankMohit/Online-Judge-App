import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ArrowDownUp, Search, X } from "lucide-react";
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (field, dir) => {
    dispatch(setFilters({ sort: `${field}_${dir}` }));
  };

  const activeFilterCount = [
    filters.difficulty,
    filters.tag,
    filters.sort,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    dispatch(setFilters({ difficulty: "", tag: "", sort: "" }));
    dispatch(setSearchQuery(""));
  };

  return (
    // Full width within the parent max-w-3xl wrapper — no internal mx-auto needed
    <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full">

      {/* Search bar — grows to fill available space */}
      <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus-within:border-purple-500 transition-colors w-full sm:flex-1">
        <Search size={18} className="text-zinc-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search problems by name or number..."
          className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm"
        />
        {searchQuery && (
          <button onClick={() => dispatch(setSearchQuery(""))}>
            <X size={16} className="text-zinc-400 hover:text-white transition" />
          </button>
        )}
      </div>

      {/* Filter & Sort row */}
      <div className="flex items-center justify-center gap-2 shrink-0">
        {/* Filter */}
        <div className="relative z-20" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm font-medium ${
              activeFilterCount > 0
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-purple-500"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-purple-700 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute mt-2 bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-xl w-64 z-20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-purple-400 font-semibold text-sm">Filter by</h4>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-zinc-400 hover:text-white transition"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        dispatch(setFilters({ difficulty: filters.difficulty === d ? "" : d }))
                      }
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        filters.difficulty === d
                          ? d === "Easy" ? "bg-green-500/20 text-green-400 border border-green-500"
                            : d === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500"
                            : "bg-red-500/20 text-red-400 border border-red-500"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Tags</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {tagsLoading ? (
                    <span className="text-zinc-400 text-sm">Loading...</span>
                  ) : tagsError ? (
                    <span className="text-red-400 text-sm">{tagsError}</span>
                  ) : tags.length === 0 ? (
                    <span className="text-zinc-400 text-sm">No tags</span>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = filters.tag.split(",").includes(tag);
                      return (
                        <button
                          key={tag}
                          className={`px-2.5 py-1 rounded-full text-xs transition capitalize ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
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
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm font-medium ${
              filters.sort
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-purple-500"
            }`}
          >
            <ArrowDownUp size={15} />
            <span>Sort</span>
          </button>

          {sortOpen && (
            <div className="absolute mt-2 bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-xl w-44 z-20">
              <h4 className="text-purple-400 font-semibold text-sm mb-3">Sort by</h4>
              <ul className="space-y-1 text-sm">
                {[
                  { label: "Number (Asc)", field: "problemNumber", dir: "asc" },
                  { label: "Number (Desc)", field: "problemNumber", dir: "desc" },
                  { label: "Difficulty (Easy)", field: "difficulty", dir: "asc" },
                  { label: "Difficulty (Hard)", field: "difficulty", dir: "desc" },
                ].map(({ label, field, dir }) => {
                  const val = `${field}_${dir}`;
                  return (
                    <li
                      key={val}
                      onClick={() => {
                        handleSortChange(field, dir);
                        setSortOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg cursor-pointer transition ${
                        filters.sort === val
                          ? "bg-purple-600/30 text-purple-300"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        <div className="hidden sm:flex gap-1.5 flex-wrap">
          {filters.difficulty && (
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
              {filters.difficulty}
              <button onClick={() => dispatch(setFilters({ difficulty: "" }))}>
                <X size={10} className="hover:text-white" />
              </button>
            </span>
          )}
          {filters.tag && filters.tag.split(",").filter(Boolean).map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300 capitalize">
              {t}
              <button onClick={() => {
                const updated = filters.tag.split(",").filter((x) => x !== t);
                dispatch(setFilters({ tag: updated.join(",") }));
              }}>
                <X size={10} className="hover:text-white" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemControls;