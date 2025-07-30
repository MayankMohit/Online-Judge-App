import { useState, useEffect, useRef } from "react";
import TestCaseCard from "../TestCaseCard";
import { ChevronsRight, ChevronsLeft } from "lucide-react";

export default function TestCaseSection({
  problem,
  formErrors,
  addTestCase,
  updateTestCase,
  removeTestCase,
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    const initial = new Set();
    for (let i = 0; i < Math.min(5, problem.testCases.length); i++) {
      initial.add(problem.testCases[i].id);
    }
    setExpandedIds(initial);
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(problem.testCases.map((tc) => tc.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  useEffect(() => {
    if (problem.testCases.length === 0) return;
    const latest = problem.testCases[problem.testCases.length - 1];
    if (!expandedIds.has(latest.id)) {
      setExpandedIds((prev) => new Set([...prev, latest.id]));

      setTimeout(() => {
        const card = document.getElementById(`testcase-${latest.id}`);
        if (card && containerRef.current) {
          card.scrollIntoView({ behavior: "smooth", inline: "end" });
        }
      }, 100);
    }
  }, [problem.testCases]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="sm:text-lg text-lg font-semibold">
          Test Cases <br className="sm:hidden block" />
          <span className="text-red-400 sm:text-sm text-xs sm:ml-10">
            {formErrors.testCases || <span>&nbsp;</span>}
          </span>
        </h3>
        <div className="flex gap-5">
          <button onClick={expandAll} className="text-green-400 text-sm">
            <ChevronsRight size={30} />
          </button>
          <button onClick={collapseAll} className="text-red-400 text-sm">
            <ChevronsLeft size={30} />
          </button>
          <button
            onClick={addTestCase}
            className="bg-purple-700 hover:bg-purple-800 sm:px-4 sm:py-2 rounded-lg sm:text-sm text-lg sm:w-35 w-20 transition-all"
          >
            + Add <span className="sm:inline hidden">Test Case</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar sm:pb-2 h-70" ref={containerRef}>
        <div className="inline-flex gap-4">
          {problem.testCases.map((tc, idx) => (
            <TestCaseCard
              key={tc.id || idx}
              index={idx}
              testCase={tc}
              onChange={updateTestCase}
              onRemove={removeTestCase}
              isExpanded={expandedIds.has(tc.id)}
              toggleExpand={() => toggleExpand(tc.id)}
              id={`testcase-${tc.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
