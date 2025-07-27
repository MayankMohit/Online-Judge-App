import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const dummyProblem = {
  id: "101",
  title: "Two Sum",
  statement: "Find two numbers that sum to a target.",
  difficulty: "Easy",
  tags: "Array, Hashing",
  inputFormat: "First line contains n, followed by n integers",
  outputFormat: "Indices of two numbers",
  constraints: "1 <= n <= 10^5",
  sampleInput: "4\n2 7 11 15",
  sampleOutput: "0 1",
  visibility: true,
  testCases: [
    { input: "2 7 11 15", expectedOutput: "0 1", isHidden: false },
    { input: "3 2 4", expectedOutput: "1 2", isHidden: true },
  ],
};

export default function ProblemManagement() {
  const { problemId } = useParams();
  const isEditing = Boolean(problemId);

  const [problem, setProblem] = useState(
    isEditing
      ? dummyProblem
      : {
          title: "",
          statement: "",
          difficulty: "",
          tags: "",
          inputFormat: "",
          outputFormat: "",
          constraints: "",
          sampleInput: "",
          sampleOutput: "",
          visibility: false,
          testCases: [],
        }
  );

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setProblem((prev) => ({ ...prev, [field]: value }));
  };

  const addTestCase = () => {
    setProblem((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: "", expectedOutput: "", isHidden: false },
      ],
    }));
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...problem.testCases];
    updated[index][field] = value;
    setProblem((prev) => ({ ...prev, testCases: updated }));
  };

  const toggleVisibility = () => {
    setProblem((prev) => ({ ...prev, visibility: !prev.visibility }));
  };

  const validate = () => {
    const newErrors = {};
    if (!problem.title.trim()) newErrors.title = "Title is required.";
    if (!problem.statement.trim())
      newErrors.statement = "Problem statement is required.";
    if (!["Easy", "Medium", "Hard"].includes(problem.difficulty))
      newErrors.difficulty = "Difficulty must be Easy, Medium, or Hard.";
    if (!problem.tags.trim())
      newErrors.tags = "At least one tag is required.";
    if (!problem.inputFormat.trim())
      newErrors.inputFormat = "Input format is required.";
    if (!problem.outputFormat.trim())
      newErrors.outputFormat = "Output format is required.";
    if (!problem.constraints.trim())
      newErrors.constraints = "Constraints are required.";
    if (!problem.sampleInput.trim())
      newErrors.sampleInput = "Sample input is required.";
    if (!problem.sampleOutput.trim())
      newErrors.sampleOutput = "Sample output is required.";

    if (problem.testCases.length < 5) {
      newErrors.testCases = "At least 5 test cases are required.";
    } else {
      problem.testCases.forEach((tc, idx) => {
        if (!tc.input.trim() || !tc.expectedOutput.trim()) {
          newErrors.testCases = `Test case ${idx + 1} is incomplete.`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (isEditing) {
      console.log("Edited Problem:", problem);
    } else {
      console.log("New Problem Added:", problem);
    }
  };

  // Real-time validation
  useEffect(() => {
    validate();
  }, [problem]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
      <div className="w-[80%]">
        <h1 className="text-3xl font-bold text-purple-400 text-center mb-4">
          {isEditing ? "Edit Problem" : "Add New Problem"}
        </h1>

        <div className="bg-gray-800 rounded-xl p-5 shadow-lg space-y-4">
          {/* Title */}
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm">Title</label>
            <input
              type="text"
              placeholder="Enter problem title"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 focus:outline-none"
              value={problem.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}

          {/* Statement */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Statement</label>
            <textarea
              placeholder="Enter problem statement"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[100px] resize-none"
              value={problem.statement}
              onChange={(e) => handleChange("statement", e.target.value)}
            />
          </div>
          {errors.statement && (
            <p className="text-red-400 text-xs">{errors.statement}</p>
          )}

          {/* Difficulty + Visibility */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <label className="w-32 text-sm">Difficulty</label>
              <select
                className="flex-1 bg-gray-700 text-white rounded-lg p-2"
                value={problem.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            {isEditing ? (
              <button
                onClick={toggleVisibility}
                className={`px-4 py-2 rounded-lg ${
                  problem.visibility
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {problem.visibility ? "Public" : "Private"}
              </button>
            ) : (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={problem.visibility}
                  onChange={() =>
                    setProblem((prev) => ({
                      ...prev,
                      visibility: !prev.visibility,
                    }))
                  }
                />
                <span>Make Public</span>
              </label>
            )}
          </div>
          {errors.difficulty && (
            <p className="text-red-400 text-xs">{errors.difficulty}</p>
          )}

          {/* Tags */}
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm">Tags</label>
            <input
              type="text"
              placeholder="Enter tags (comma separated)"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2"
              value={problem.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
          </div>
          {errors.tags && <p className="text-red-400 text-xs">{errors.tags}</p>}

          {/* Input Format */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Input Format</label>
            <textarea
              placeholder="Describe input format"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[80px] resize-none"
              value={problem.inputFormat}
              onChange={(e) => handleChange("inputFormat", e.target.value)}
            />
          </div>
          {errors.inputFormat && (
            <p className="text-red-400 text-xs">{errors.inputFormat}</p>
          )}

          {/* Output Format */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Output Format</label>
            <textarea
              placeholder="Describe output format"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[80px] resize-none"
              value={problem.outputFormat}
              onChange={(e) => handleChange("outputFormat", e.target.value)}
            />
          </div>
          {errors.outputFormat && (
            <p className="text-red-400 text-xs">{errors.outputFormat}</p>
          )}

          {/* Constraints */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Constraints</label>
            <textarea
              placeholder="Enter constraints"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[80px] resize-none"
              value={problem.constraints}
              onChange={(e) => handleChange("constraints", e.target.value)}
            />
          </div>
          {errors.constraints && (
            <p className="text-red-400 text-xs">{errors.constraints}</p>
          )}

          {/* Sample Input */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Sample Input</label>
            <textarea
              placeholder="Sample input"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[60px] resize-none"
              value={problem.sampleInput}
              onChange={(e) => handleChange("sampleInput", e.target.value)}
            />
          </div>
          {errors.sampleInput && (
            <p className="text-red-400 text-xs">{errors.sampleInput}</p>
          )}

          {/* Sample Output */}
          <div className="flex items-start gap-4">
            <label className="w-32 text-sm">Sample Output</label>
            <textarea
              placeholder="Sample output"
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 h-[60px] resize-none"
              value={problem.sampleOutput}
              onChange={(e) => handleChange("sampleOutput", e.target.value)}
            />
          </div>
          {errors.sampleOutput && (
            <p className="text-red-400 text-xs">{errors.sampleOutput}</p>
          )}

          {/* Test Cases */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-purple-300">
                Test Cases
              </h3>
              <button
                onClick={addTestCase}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-lg text-sm"
              >
                + Add Test Case
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {problem.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 rounded-lg p-3 min-w-[220px]"
                >
                  <input
                    type="text"
                    placeholder="Input"
                    className="w-full bg-gray-600 text-white rounded-lg p-1 mb-2"
                    value={tc.input}
                    onChange={(e) =>
                      updateTestCase(idx, "input", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Expected Output"
                    className="w-full bg-gray-600 text-white rounded-lg p-1 mb-2"
                    value={tc.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(idx, "expectedOutput", e.target.value)
                    }
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={(e) =>
                        updateTestCase(idx, "isHidden", e.target.checked)
                      }
                    />
                    Hidden
                  </label>
                </div>
              ))}
            </div>
            {errors.testCases && (
              <p className="text-red-400 text-xs mt-1">{errors.testCases}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            {isEditing && (
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
                Delete Problem
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              {isEditing ? "Edit Problem" : "Add Problem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
