import { Trash2 } from "lucide-react";

export default function TestCaseCard({ index, testCase, onChange, onRemove }) {
  const handleInputChange = (e) => {
    onChange(index, { ...testCase, input: e.target.value });
  };

  const handleOutputChange = (e) => {
    onChange(index, { ...testCase, output: e.target.value });
  };

  const handleHiddenChange = (e) => {
    onChange(index, { ...testCase, isHidden: e.target.checked });
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg mb-3 shadow border border-gray-700 relative text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Test Case {index + 1}</h3>
        <div className="flex items-center gap-2">
          <label className="text-gray-300 flex items-center gap-1">
            <input
              type="checkbox"
              checked={testCase.isHidden || false}
              onChange={handleHiddenChange}
              className="form-checkbox h-4 w-4 text-purple-600 bg-gray-900 border-gray-600"
              title="Hide this test case"
            />
            <span className="text-xs mr-5">Hidden</span>
          </label>
          <button
            onClick={() => onRemove(index)}
            type="button"
            className="text-red-400 hover:text-red-600 transition"
            title="Remove test case"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-1">
        <label className="block text-xs text-gray-300 mb-1">Input</label>
        <textarea
          className="w-full p-1.5 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
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
          className="w-full p-1.5 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
          rows={2}
          value={testCase.output}
          onChange={handleOutputChange}
          required
        />
      </div>
    </div>
  );
}
