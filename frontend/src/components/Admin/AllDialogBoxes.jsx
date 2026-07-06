import ConfirmClearAllDialog from "./ConfirmClearAllDialog";
import ConfirmAddProblemDialog from "./ConfirmAddProblemDialog";
import ConfirmEditProblemDialog from "./ConfirmEditProblemDialog";
import ConfirmDeleteProblemDialog from "./ConfirmDeleteProblemDialog";
import ConfirmResetChangesDialog from "./ConfirmResetDialog";
import { useProblemMutations } from "../../hooks/adminHooks/useProblemMutations";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AllDialogBoxes = ({
  showClearDialog,
  setShowClearDialog,
  showAddDialog,
  setShowAddDialog,
  showEditDialog,
  setShowEditDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  showResetDialog,
  setShowResetDialog,
  setProblem,
  setFormErrors,
  problem,
  originalProblem,
  contestId,
  contestPoints,
  returnTo,
  reference,
}) => {
  const { createProblem, updateProblem, deleteProblem } = useProblemMutations();
  const navigate = useNavigate();

  // Reference-solution fields sent with create/update so the backend validates
  // the test cases before persisting.
  const referencePayload = reference?.code?.trim()
    ? {
        referenceCode: reference.code,
        referenceLanguage: reference.language,
        comparisonMode: reference.comparisonMode,
        validationMode: reference.validationMode,
      }
    : {};

  // Turn a rejected mutation payload into a helpful message for the admin.
  const showMutationError = (err, fallback) => {
    if (err?.requiresReference) {
      toast.error("Add a reference solution and validate the test cases first.");
    } else if (err?.validation && !err.validation.ok) {
      const failed = (err.validation.cases || []).filter((c) => !c.passed).length;
      toast.error(
        err.message ||
          `Validation failed on ${failed} test case${failed === 1 ? "" : "s"}.`
      );
    } else {
      toast.error(err?.message || fallback);
    }
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

  const handleAddConfirm = async () => {
    try {
      const sanitizedProblem = {
        ...problem,
        testCases: problem.testCases.map(
          ({ input, expectedOutput, isHidden }) => ({
            input: input?.trim() || "",
            expectedOutput: expectedOutput?.trim() || "",
            isHidden: !!isHidden,
          })
        ),
        ...referencePayload,
        ...(contestId && {
          contestId,
          points: Math.max(1, Number(contestPoints) || 100),
        }),
      };
      await createProblem(sanitizedProblem).unwrap();
      toast.success(
        contestId ? "Contest problem added" : "Problem added successfully"
      );
      setShowAddDialog(false);
      navigate(returnTo || "/admin");
    } catch (err) {
      console.error("Add failed:", err);
      showMutationError(err, "Failed to add problem");
    }
  };

  const handleEditConfirm = async () => {
    try {
      await updateProblem(problem._id, { ...problem, ...referencePayload }).unwrap();
      toast.success("Problem updated successfully");
      setShowEditDialog(false);
      navigate("/admin");
    } catch (err) {
      console.error("Edit failed:", err);
      showMutationError(err, "Failed to update problem");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProblem(problem._id).unwrap();
      toast.success("Problem deleted successfully");
      setShowDeleteDialog(false);
      navigate("/admin");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete problem");
    }
  };

  const handleResetConfirm = () => {
    setProblem(originalProblem);
    setFormErrors({});
    setShowResetDialog(false);
  };

  return (
    <>
      <ConfirmClearAllDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleConfirmClear}
      />

      <ConfirmAddProblemDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onConfirm={handleAddConfirm}
      />

      <ConfirmEditProblemDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onConfirm={handleEditConfirm}
      />

      <ConfirmDeleteProblemDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmResetChangesDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetConfirm}
      />
    </>
  );
};

export default AllDialogBoxes;
