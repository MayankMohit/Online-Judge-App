import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export const useProblemFormHandlers = ({
  setProblem,
  setFormErrors,
  setShowAddDialog,
  setShowEditDialog,
  setShowClearDialog,
  isEditing,
  problem,
  originalProblem,
}) => {
  const safeTestCases = problem?.testCases || [];

  const handleChange = useCallback(
    (field, value) => {
      setProblem((prev) => ({ ...prev, [field]: value }));
    },
    [setProblem]
  );

  const addTestCase = useCallback(() => {
    const id = uuidv4();
    setProblem((prev) => ({
      ...prev,
      testCases: [
        ...(prev.testCases || []),
        { id, input: "", expectedOutput: "", isHidden: false },
      ],
    }));
  }, [setProblem]);

  const updateTestCase = useCallback(
    (index, updatedTestCase) => {
      if (!Array.isArray(safeTestCases)) return;
      const updated = [...safeTestCases];
      updated[index] = updatedTestCase;
      setProblem((prev) => ({ ...prev, testCases: updated }));
    },
    [safeTestCases, setProblem]
  );

  const removeTestCase = useCallback(
    (index) => {
      if (!Array.isArray(safeTestCases)) return;
      const updated = [...safeTestCases];
      updated.splice(index, 1);
      setProblem((prev) => ({ ...prev, testCases: updated }));
    },
    [safeTestCases, setProblem]
  );

  const validateProblem = useCallback(() => {
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
      if (
        field === "tags" ? !problem?.tags?.length : !problem?.[field]?.trim?.()
      ) {
        errors[field] = true;
      }
    });

    if (!["Easy", "Medium", "Hard"].includes(problem?.difficulty)) {
      errors.difficulty = true;
    }

    const testCases = problem?.testCases || [];
    if (testCases.length < 5) {
      errors.testCases = "Minimum 5 Test Cases Required";
    }

    const inputSet = new Set();
    const ioPairSet = new Set();

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const input = tc?.input?.trim() || "";
      const output = tc?.expectedOutput?.trim() || "";

      if (!output) {
        errors[`testCases_${i}_output`] = "Output required";
        errors.testCases = errors.testCases || "Output are Required!";
      }

      const ioKey = `${input}::${output}`;
      const inputKey = input;

      if (ioPairSet.has(ioKey)) {
        errors.testCases = "Duplicate Test Cases Found!";
      } else {
        ioPairSet.add(ioKey);
      }

      if (inputSet.has(inputKey)) {
        errors[`testCases_${i}_input`] = "Duplicate Input not allowed!";
        errors.testCases = "Unique Inputs Required!";
      } else {
        inputSet.add(inputKey);
      }
    }

    return errors;
  }, [problem]);

  const handleSubmit = useCallback(() => {
    const errors = validateProblem();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    isEditing ? setShowEditDialog(true) : setShowAddDialog(true);
  }, [
    validateProblem,
    setFormErrors,
    isEditing,
    setShowEditDialog,
    setShowAddDialog,
  ]);

  const handleReset = useCallback(() => {
    if (isEditing && originalProblem) {
      setProblem({
        ...originalProblem,
        testCases: originalProblem.testCases?.length
          ? originalProblem.testCases
          : [{ input: "", expectedOutput: "", isHidden: false }],
      });
      setFormErrors({});
    } else {
      setShowClearDialog(true);
    }
  }, [
    isEditing,
    originalProblem,
    setProblem,
    setFormErrors,
    setShowClearDialog,
  ]);

  return {
    handleChange,
    addTestCase,
    updateTestCase,
    removeTestCase,
    handleSubmit,
    handleReset,
    validateProblem,
  };
};
