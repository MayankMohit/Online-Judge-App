import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestCaseCard({
  index,
  testCase,
  onChange,
  onRemove,
  isExpanded,
  toggleExpand,
  showHiddenToggle = true,
}) {
  const handleInputChange = (e) => {
    onChange(index, { ...testCase, input: e.target.value });
  };

  const handleOutputChange = (e) => {
    onChange(index, { ...testCase, expectedOutput: e.target.value });
  };

  const handleHiddenChange = (e) => {
    onChange(index, { ...testCase, isHidden: e.target.checked });
  };

  return (
    <div
      className={`relative transition-[width] duration-300 ease-in-out border border-gray-700 rounded-lg shadow 
        ${isExpanded ? "w-[200px] bg-gray-800" : "w-[40px] bg-gray-950"} 
        h-[260px] inline-block shrink-0 overflow-hidden`}
    >
      {isExpanded ? (
        <div className="flex flex-col h-full justify-between p-2">
          {/* Top Row */}
          <div className="flex justify-between items-start mx-2">
            <h3 className="text-white text-sm font-semibold">{index + 1}.</h3>
            <button
              onClick={() => toggleExpand(index)}
              type="button"
              className="text-white"
              title="Collapse"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 mt-4 overflow-auto">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Input</label>
              <textarea
                className="w-full p-1 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none resize-none"
                rows={2}
                value={testCase.input}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Output <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-1.5 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none resize-none"
                value={testCase.expectedOutput}
                onChange={handleOutputChange}
                rows={2}
                required
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-between items-center mx-1 mt-1">
            {showHiddenToggle && (
              <label className="text-gray-300 text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={testCase.isHidden}
                  onChange={handleHiddenChange}
                  className="form-checkbox h-4 w-4 text-purple-600 bg-gray-900 border-gray-600"
                />
                Hidden
              </label>
            )}
            <button
              onClick={() => onRemove(index)}
              type="button"
              className="text-red-400 hover:text-red-600"
              title="Remove test case"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between items-center h-full py-2 px-1">
          <button
            onClick={() => toggleExpand(index)}
            type="button"
            className="flex flex-col items-center gap-3 h-55 text-white focus:outline-none"
            title="Expand"
          >
            <ChevronRight size={18} />
            <span className="text-sm font-semibold">{index + 1}.</span>
          </button>
          <button
            onClick={() => onRemove(index)}
            type="button"
            className="text-red-400 hover:text-red-600"
            title="Remove"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
