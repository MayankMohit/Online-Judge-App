import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";

import { useAllTags } from "../../hooks/otherHooks/useAllTags";
import { useAdminProblem } from "../../hooks/adminHooks/useAdminProblem";
import { useProblemFormHandlers } from "../../hooks/otherHooks/useProblemFormHandlers";
import { fetchAutocomplete, clearAutocompleteError } from "../../features/ai/aiSlice";

import AllDialogBoxes from "../../components/Admin/AllDialogBoxes";
import FormFieldRow from "../../components/Admin/FormFieldRow";
import TestCaseSection from "../../components/Admin/TestCaseSection";
import FooterButtons from "../../components/Admin/FooterButtons";
import DifficultyTagsRow from "../../components/Admin/DifficultyTagsRow";
import TitleStatementFields from "../../components/Admin/TitleStatementFields";
import AutocompleteButton from "../../components/Admin/AutocompleteButton";
import TopBar from "../submissionPages/TopBar";

// Fields that AI can fill (everything except title, which the user always owns)
const AI_FIELDS = [
  "statement", "difficulty", "tags",
  "inputFormat", "outputFormat", "constraints",
  "sampleInput", "sampleOutput", "testCases",
];

const defaultProblem = {
  title: "",
  statement: "",
  difficulty: "",
  tags: [],
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  testCases: [
    { input: "", expectedOutput: "", isHidden: false, id: uuidv4() },
  ],
};

export default function ProblemManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { problemNumber } = useParams();
  const isEditing = !!problemNumber;

  const { tags: existingTags = [] } = useAllTags();
  const { problem: fetchedProblem, loading } = useAdminProblem(problemNumber);

  const { autocompleteLoading, autocompleteError } = useSelector((s) => s.ai);

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const [problem, setProblem] = useState(defaultProblem);
  const [formErrors, setFormErrors] = useState({});

  // Track which field values the user typed themselves (before AI fills them)
  // This lets us restore user values on reset
  const [userSnapshot, setUserSnapshot] = useState(null);
  // True once AI has successfully filled fields
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  useEffect(() => {
    if (isEditing && fetchedProblem) {
      const testCasesWithIds = (fetchedProblem.testCases || []).map((tc) => ({
        ...tc,
        id: tc.id || uuidv4(),
      }));
      setProblem({ ...defaultProblem, ...fetchedProblem, testCases: testCasesWithIds });
    }
  }, [isEditing, fetchedProblem]);

  const {
    handleChange,
    addTestCase,
    updateTestCase,
    removeTestCase,
    handleReset,
    handleSubmit,
    validateProblem,
  } = useProblemFormHandlers({
    setProblem,
    setFormErrors,
    setShowAddDialog,
    setShowEditDialog,
    setShowClearDialog,
    isEditing,
    problem,
    originalProblem: fetchedProblem,
  });

  useEffect(() => { validateProblem(); }, [problem]);

  useEffect(() => {
    const handleSuccess = () => {
      toast.success(isEditing ? "Problem updated successfully" : "Problem added successfully");
      navigate("/admin");
    };
    const handleDelete = () => {
      toast.success("Problem deleted successfully");
      navigate("/admin");
    };
    if (showAddDialog === "confirmed") handleSuccess();
    else if (showEditDialog === "confirmed") handleSuccess();
    else if (showDeleteDialog === "confirmed") handleDelete();
  }, [showAddDialog, showEditDialog, showDeleteDialog, isEditing, navigate]);

  // ─── Autocomplete handlers ─────────────────────────────────────────────────

  const handleAutocomplete = async () => {
    if (!problem.title.trim()) return;
    dispatch(clearAutocompleteError());

    // Snapshot current user-typed values before AI overwrites them
    const snapshot = {};
    AI_FIELDS.forEach((field) => {
      snapshot[field] = problem[field];
    });
    setUserSnapshot(snapshot);

    const result = await dispatch(fetchAutocomplete({
      title: problem.title,
      statement: problem.statement,
    }));

    if (fetchAutocomplete.fulfilled.match(result)) {
      const data = result.payload;

      // Add UUIDs to test cases from AI
      const testCasesWithIds = (data.testCases || []).map((tc) => ({
        ...tc,
        id: uuidv4(),
      }));

      setProblem((prev) => ({
        ...prev,
        // Only overwrite fields AI returned — keep title always
        ...(data.statement   && { statement: data.statement }),
        ...(data.difficulty  && { difficulty: data.difficulty }),
        ...(data.tags?.length && { tags: data.tags }),
        ...(data.inputFormat  && { inputFormat: data.inputFormat }),
        ...(data.outputFormat && { outputFormat: data.outputFormat }),
        ...(data.constraints  && { constraints: data.constraints }),
        ...(data.sampleInput  && { sampleInput: data.sampleInput }),
        ...(data.sampleOutput && { sampleOutput: data.sampleOutput }),
        ...(testCasesWithIds.length && { testCases: testCasesWithIds }),
      }));

      setIsAIGenerated(true);
      toast.success("Problem fields filled by AI!");
    }
  };

  const handleResetAI = () => {
    if (!userSnapshot) return;

    // Restore whatever the user had typed before AI filled the fields
    // For array fields like testCases, restore with IDs
    const restoredTestCases = (userSnapshot.testCases || []).map((tc) => ({
      ...tc,
      id: tc.id || uuidv4(),
    }));

    setProblem((prev) => ({
      ...prev,
      ...userSnapshot,
      testCases: restoredTestCases.length
        ? restoredTestCases
        : [{ input: "", expectedOutput: "", isHidden: false, id: uuidv4() }],
    }));

    setIsAIGenerated(false);
    setUserSnapshot(null);
    dispatch(clearAutocompleteError());
    toast.success("Reset to your original values");
  };

  if (isEditing && loading) {
    return <p className="text-center text-gray-400">Loading problem...</p>;
  }

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TopBar
        title={isEditing ? "Edit Problem" : "Add Problem"}
        onBack={() => navigate(-1)}
      />
      <div className="sm:w-[70vw] w-[95%] mx-auto sm:my-6 my-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:p-6 p-3 shadow-lg sm:space-y-4 space-y-2">

          <TitleStatementFields
            problem={problem}
            handleChange={handleChange}
            formErrors={formErrors}
          />

          {/* AI Autocomplete button — sits right below Statement */}
          {!isEditing && (
            <AutocompleteButton
              onGenerate={handleAutocomplete}
              onReset={handleResetAI}
              isGenerated={isAIGenerated}
              isLoading={autocompleteLoading}
              disabled={!problem.title.trim()}
              error={autocompleteError}
            />
          )}

          <DifficultyTagsRow
            problem={problem}
            setProblem={setProblem}
            formErrors={formErrors}
            existingTags={existingTags}
          />

          {[
            ["Input Format", "inputFormat"],
            ["Output Format", "outputFormat"],
            ["Constraints", "constraints"],
            ["Sample Input", "sampleInput"],
            ["Sample Output", "sampleOutput"],
          ].map(([label, field]) => (
            <FormFieldRow
              key={field}
              label={label}
              field={field}
              value={problem[field]}
              onChange={handleChange}
              error={formErrors[field]}
            />
          ))}

          <TestCaseSection
            problem={problem}
            formErrors={formErrors}
            addTestCase={addTestCase}
            updateTestCase={updateTestCase}
            removeTestCase={removeTestCase}
          />

          <FooterButtons
            isEditing={isEditing}
            onDelete={() => setShowDeleteDialog(true)}
            onResetToOriginal={() => setShowResetDialog(true)}
            onClearAll={() => setShowClearDialog(true)}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <AllDialogBoxes
        showClearDialog={showClearDialog}
        setShowClearDialog={setShowClearDialog}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        showResetDialog={showResetDialog}
        setShowResetDialog={setShowResetDialog}
        setProblem={setProblem}
        setFormErrors={setFormErrors}
        problem={problem}
        originalProblem={fetchedProblem}
        handleReset={handleReset}
      />
    </div>
  );
}