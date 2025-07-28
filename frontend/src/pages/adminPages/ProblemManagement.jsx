import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAllTags } from "../../hooks/otherHooks/useAllTags";
import TagSelect from "../../components/TagSelect";
import TestCaseCard from "../../components/TestCaseCard";
import { useNavigate } from "react-router-dom";
import ConfirmClearAllDialog from "../../components/Admin/ConfirmClearAllDialog";
import ConfirmAddProblemDialog from "../../components/Admin/ConfirmAddProblemDialog";
import ConfirmEditProblemDialog from "../../components/Admin/ConfirmEditProblemDialog";
import ConfirmDeleteProblemDialog from "../../components/Admin/ConfirmDeleteProblemDialog";

const difficultyLevels = ["Easy", "Medium", "Hard"];

export default function ProblemManagement({ mode, data }) {
  const navigate = useNavigate();
  const isEditing = mode === "edit";
  const { tags: existingTags = [] } = useAllTags();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [problem, setProblem] = useState(
    isEditing
      ? data
      : {
          title: "",
          statement: "",
          difficulty: "",
          tags: [],
          inputFormat: "",
          outputFormat: "",
          constraints: "",
          sampleInput: "",
          sampleOutput: "",
          testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        }
  );

  const [formErrors, setFormErrors] = useState({});

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

  const updateTestCase = (index, updatedTestCase) => {
    const updated = [...problem.testCases];
    updated[index] = updatedTestCase;
    setProblem((prev) => ({ ...prev, testCases: updated }));
  };

  const removeTestCase = (index) => {
    const updated = [...problem.testCases];
    updated.splice(index, 1);
    setProblem((prev) => ({ ...prev, testCases: updated }));
  };

  const validateProblem = () => {
    const errors = {};
    const requiredFields = [
      "title",
      "statement",
      "difficulty",
      "tags",
      "inputFormat",
      "outputFormat",
      "constraints",
      "sampleInput",
      "sampleOutput",
    ];

    requiredFields.forEach((field) => {
      if (field === "tags" ? !problem.tags.length : !problem[field]?.trim?.()) {
        errors[field] = true;
      }
    });

    if (!difficultyLevels.includes(problem.difficulty)) {
      errors.difficulty = true;
    }

    const testCases = problem.testCases || [];
    if (testCases.length < 5) {
      errors.testCases = "Minimum 5 test cases required";
    }

    const seen = new Set();
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!tc.expectedOutput.trim()) {
        errors[`testCases_${i}_output`] = "Output required";
      }

      const key = `${tc.input.trim()}::${tc.expectedOutput.trim()}`;
      if (seen.has(key)) {
        errors.testCases = "Duplicate test cases found";
      }
      seen.add(key);
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateProblem();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (isEditing) {
      setShowEditDialog(true);
    } else {
      setShowAddDialog(true);
    }
  };

  const handleReset = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    setProblem({
      title: "",
      statement: "",
      difficulty: "",
      tags: [],
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      sampleInput: "",
      sampleOutput: "",
      testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    });
    setFormErrors({});
    setShowClearDialog(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6 custom-scrollbar overflow-auto">
      <div className="w-[50vw] mx-auto ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 fixed top-5 left-5 z-50 rounded-md bg-gray-800 px-2 py-1 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-bold text-purple-400 text-center mb-6">
          {isEditing ? "Edit Problem" : "Add New Problem"}
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          {/* form fields omitted for brevity */}
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`flex-1 bg-gray-700 rounded-lg p-2 ${
                formErrors.title ? "border border-red-500" : ""
              }`}
              value={problem.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Statement */}
          <div className="flex gap-4">
            <label className="w-32 text-sm">Statement <span className="text-red-500">*</span></label>
            <textarea
              className={`flex-1 bg-gray-700 rounded-lg p-2 h-[100px] resize-none custom-scrollbar ${
                formErrors.statement ? "border border-red-500" : ""
              }`}
              value={problem.statement}
              onChange={(e) => handleChange("statement", e.target.value)}
            />
          </div>

          {/* Difficulty + Tags */}
          <div className="flex">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm w-34">Difficulty <span className="text-red-500">*</span></label>
              <select
                className={`flex-1 bg-gray-700 rounded-lg p-2 max-w-27 ${
                  formErrors.difficulty ? "border border-red-500" : ""
                }`}
                value={problem.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex flex-row flex-1">
              <label className="text-sm w-20 mt-1.5 -ml-15">Tags <span className="text-red-500">*</span></label>
              <TagSelect
                selectedTags={problem.tags}
                allTags={existingTags}
                onChange={(tags) => setProblem({ ...problem, tags })}
                error={formErrors.tags}
              />
            </div>
          </div>

          {/* Repeated Textareas */}
          {[
            ["Input Format", "inputFormat"],
            ["Output Format", "outputFormat"],
            ["Constraints", "constraints"],
            ["Sample Input", "sampleInput"],
            ["Sample Output", "sampleOutput"],
          ].map(([label, field]) => (
            <div className="flex gap-4" key={field}>
              <label className="w-32 text-sm">{label} <span className="text-red-500">*</span></label>
              <textarea
                className={`flex-1 bg-gray-700 rounded-lg p-2 h-[60px] custom-scrollbar resize-none ${
                  formErrors[field] ? "border border-red-500" : ""
                }`}
                value={problem[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}

          {/* Test Cases */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold">
                Test Cases{" "}
                <span className="text-red-400 text-xs">
                  {formErrors.testCases || ""}
                </span>
              </h3>
              <button
                onClick={addTestCase}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-lg text-sm"
              >
                + Add Test Case
              </button>
            </div>

            <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-2">
              {problem.testCases.map((tc, idx) => (
                <div key={idx} className="min-w-[320px] shrink-0">
                  <TestCaseCard
                    index={idx}
                    testCase={tc}
                    onChange={updateTestCase}
                    onRemove={removeTestCase}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Footer Buttons */}
          <div className="flex justify-between mt-6">
            {isEditing ? (
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={24} />
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="text-red-400 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white"
              >
                Clear All
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              {isEditing ? "Save Changes" : "Add Problem"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmClearAllDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleConfirmClear}
      />

      <ConfirmAddProblemDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onConfirm={() => console.log("Added", problem)}
      />

      <ConfirmEditProblemDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onConfirm={() => console.log("Edited", problem)}
      />

      <ConfirmDeleteProblemDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => console.log("Deleted")}
      />
    </div>
  );
}
