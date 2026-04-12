import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAllTags } from "../../hooks/otherHooks/useAllTags";
import { useNavigate, useParams } from "react-router-dom";
import AllDialogBoxes from "../../components/Admin/AllDialogBoxes";
import { useProblemFormHandlers } from "../../hooks/otherHooks/useProblemFormHandlers";
import FormFieldRow from "../../components/Admin/FormFieldRow";
import TestCaseSection from "../../components/Admin/TestCaseSection";
import FooterButtons from "../../components/Admin/FooterButtons";
import DifficultyTagsRow from "../../components/Admin/DifficultyTagsRow";
import TitleStatementFields from "../../components/Admin/TitleStatementFields";
import { useAdminProblem } from "../../hooks/adminHooks/useAdminProblem";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import TopBar from "../submissionPages/TopBar";

export default function ProblemManagement() {
  const navigate = useNavigate();
  const { problemNumber } = useParams();
  const isEditing = !!problemNumber;

  const { tags: existingTags = [] } = useAllTags();
  const { problem: fetchedProblem, loading } = useAdminProblem(problemNumber);

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

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

  const [problem, setProblem] = useState(defaultProblem);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEditing && fetchedProblem) {
      const testCasesWithIds = (fetchedProblem.testCases || []).map((tc) => ({
        ...tc,
        id: tc.id || uuidv4(),
      }));

      setProblem({
        ...defaultProblem,
        ...fetchedProblem,
        testCases: testCasesWithIds,
      });
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

  useEffect(() => {
    validateProblem();
  }, [problem]);

  useEffect(() => {
    const handleSuccess = () => {
      toast.success(
        isEditing
          ? "Problem updated successfully"
          : "Problem added successfully",
      );
      navigate("/admin");
    };

    const handleDelete = () => {
      toast.success("Problem deleted successfully");
      navigate("/admin");
    };

    if (showAddDialog === "confirmed") {
      handleSuccess();
    } else if (showEditDialog === "confirmed") {
      handleSuccess();
    } else if (showDeleteDialog === "confirmed") {
      handleDelete();
    }
  }, [showAddDialog, showEditDialog, showDeleteDialog, isEditing, navigate]);

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
