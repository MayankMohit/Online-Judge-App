import { useState, useEffect, useRef } from "react";
import TestCaseCard from "../TestCaseCard";

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
    // Expand first 5 test cases initially
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
    // Auto-expand new test case
    if (problem.testCases.length === 0) return;
    const latest = problem.testCases[problem.testCases.length - 1];
    if (!expandedIds.has(latest.id)) {
      setExpandedIds((prev) => new Set([...prev, latest.id]));

      // Scroll into view
      setTimeout(() => {
        const card = document.getElementById(`testcase-${latest.id}`);
        if (card && containerRef.current) {
          card.scrollIntoView({ behavior: "smooth", inline: "end" });
        }
      }, 100); // delay to ensure render
    }
  }, [problem.testCases]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold">
          Test Cases{" "}
          <span className="text-red-400 text-xs">{formErrors.testCases || ""}</span>
        </h3>
        <div className="flex gap-3">
          <button onClick={expandAll} className="text-green-400 text-sm hover:underline">
            Expand All
          </button>
          <button onClick={collapseAll} className="text-red-400 text-sm hover:underline">
            Collapse All
          </button>
          <button
            onClick={addTestCase}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-lg text-sm"
          >
            + Add Test Case
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2" ref={containerRef}>
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
