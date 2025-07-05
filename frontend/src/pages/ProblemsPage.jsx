import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";
import ProblemCard from "../components/ProblemCard";

const ProblemsPage = () => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

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

  return (
    <div className="bg-gray-900 text-white px-6 py-25 sm:py-20 min-h-[calc(100vh-8rem)] relative min-w-screen">
      {/* Top Controls */}
      <div className="flex flex-row gap-2 items-center sm:justify-center mb-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                <div className="mb-2">
                  <label className="block mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. array, dp"
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block mb-1">Difficulty</label>
                  <select className="w-full px-3 py-2 rounded bg-gray-700 text-white">
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
                  <li className="hover:text-purple-300 cursor-pointer">Difficulty</li>
                  <li className="hover:text-purple-300 cursor-pointer">Problem Number</li>
                  <li className="hover:text-purple-300 cursor-pointer">Solved First</li>
                  <li className="hover:text-purple-300 cursor-pointer">Unsolved First</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="grid gap-2 md:px-50">
        {/* Mock Data - Replace with actual data from API */}
        {Array.from({ length: 20 }).map((_, index) => (
          <ProblemCard
            key={index}
            problem={{
              _id: `problem-${index + 1}`,
              title: `Problem Number xyzabc${index + 1}`,
              difficulty: index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Hard",
            }}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ProblemsPage;
