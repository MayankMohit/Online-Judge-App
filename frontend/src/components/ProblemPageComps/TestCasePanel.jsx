import { useState, useEffect } from "react";
import { Plus, X, ChevronRight } from "lucide-react";

/**
 * LeetCode-style test case panel.
 *
 * Props:
 *   testCases        — array of { id, input, label }
 *   activeIdx        — currently selected index
 *   setActiveIdx     — setter
 *   onTestCasesChange— called when test cases array changes
 *   results          — array of { output, error, time } per test case (same length, or partial)
 *   loading          — bool, is run in progress
 *   onRun            — called with the active test case's input
 *   isOutputVisible  — bool
 *   setIsOutputVisible — setter (desktop only, for toggling)
 */
const TestCasePanel = ({
  testCases,
  activeIdx,
  setActiveIdx,
  onTestCasesChange,
  results,
  loading,
  onRun,
  isOutputMode,
  setIsOutputMode,
}) => {
  const addTestCase = () => {
    const newCase = {
      id: Date.now(),
      label: `Case ${testCases.length + 1}`,
      input: "",
    };
    const updated = [...testCases, newCase];
    onTestCasesChange(updated);
    setActiveIdx(updated.length - 1);
  };

  const removeTestCase = (idx, e) => {
    e.stopPropagation();
    if (testCases.length === 1) return; // keep at least 1
    const updated = testCases.filter((_, i) => i !== idx);
    onTestCasesChange(updated);
    setActiveIdx(Math.min(activeIdx, updated.length - 1));
  };

  const updateInput = (val) => {
    const updated = testCases.map((tc, i) =>
      i === activeIdx ? { ...tc, input: val } : tc,
    );
    onTestCasesChange(updated);
  };

  const activeResult = results?.[activeIdx];
  const hasResult =
    activeResult && (activeResult.output !== undefined || activeResult.error);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top bar — tabs + add + toggle */}
      <div className="flex items-center border-b border-zinc-800 px-2 shrink-0">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 mr-3">
          <button
            onClick={() => setIsOutputMode(false)}
            className={`px-2.5 py-2 text-xs font-medium transition-colors border-b-2 ${
              !isOutputMode
                ? "text-white border-white"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            Testcase
          </button>
          <button
            onClick={() => setIsOutputMode(true)}
            className={`px-2.5 py-2 text-xs font-medium transition-colors border-b-2 ${
              isOutputMode
                ? "text-white border-white"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            Test Result
          </button>
        </div>

        {/* Case tabs */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto hide-scrollbar">
          {testCases.map((tc, idx) => {
            const result = results?.[idx];
            const passed =
              result && !result.error && result.output !== undefined;
            const failed = result && result.error;

            return (
              <button
                key={tc.id}
                onClick={() => setActiveIdx(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  activeIdx === idx
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                {/* Pass/fail dot */}
                {result && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${failed ? "bg-red-400" : "bg-green-400"}`}
                  />
                )}
                {tc.label}
                {testCases.length > 1 && (
                  <span
                    onClick={(e) => removeTestCase(idx, e)}
                    className="ml-0.5 text-zinc-600 hover:text-zinc-300 transition"
                  >
                    <X size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add case button */}
        <button
          onClick={addTestCase}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition px-2 py-2 shrink-0"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 custom-scrollbar">
        {!isOutputMode ? (
          /* INPUT MODE */
          <div className="flex flex-col gap-2 h-full">
            <p className="text-xs text-zinc-500 font-medium">Input</p>
            <textarea
              className="flex-1 min-h-[80px] bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono p-2.5 rounded-lg resize-none focus:outline-none focus:border-zinc-600 custom-scrollbar"
              placeholder="Enter input..."
              value={testCases[activeIdx]?.input || ""}
              onChange={(e) => updateInput(e.target.value)}
            />
          </div>
        ) : (
          /* OUTPUT MODE */
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                <div className="w-3 h-3 rounded-full border border-t-purple-500 animate-spin" />
                Running...
              </div>
            ) : !activeResult ||
              (!activeResult.output && !activeResult.error) ? (
              <p className="text-zinc-600 text-xs italic">
                Run your code to see output here.
                <br />
                Note: The test cases executed here are for output preview only
                and are not validated against the expected results.
              </p>
            ) : (
              <>
                {/* Input echo */}
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Input
                  </p>
                  <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-auto max-h-24 custom-scrollbar">
                    {testCases[activeIdx]?.input || "(empty)"}
                  </pre>
                </div>

                {/* Output or error */}
                {activeResult.error ? (
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-1">
                      Error
                    </p>
                    <pre className="bg-zinc-900 border border-red-900/40 rounded-lg p-2.5 text-xs font-mono text-red-400 whitespace-pre-wrap overflow-auto max-h-32 custom-scrollbar">
                      {activeResult.error}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1">
                      Output
                    </p>
                    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs font-mono text-zinc-200 whitespace-pre-wrap overflow-auto max-h-32 custom-scrollbar">
                      {activeResult.output || "(no output)"}
                    </pre>
                  </div>
                )}

                {/* Time */}
                {activeResult.time != null && (
                  <p className="text-xs text-zinc-600">{activeResult.time}ms</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasePanel;
