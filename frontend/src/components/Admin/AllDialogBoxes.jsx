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
}) => {
  const { createProblem, updateProblem, deleteProblem } = useProblemMutations();
  const navigate = useNavigate();

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
      };
      await createProblem(sanitizedProblem).unwrap();
      toast.success("Problem added successfully");
      setShowAddDialog(false);
      navigate("/admin");
    } catch (err) {
      console.error("Add failed:", err);
      toast.error("Failed to add problem");
    }
  };

  const handleEditConfirm = async () => {
    try {
      await updateProblem(problem._id, problem).unwrap();
      toast.success("Problem updated successfully");
      setShowEditDialog(false);
      navigate("/admin");
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update problem");
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
