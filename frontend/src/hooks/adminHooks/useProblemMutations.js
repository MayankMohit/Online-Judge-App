import { useDispatch, useSelector } from "react-redux";
import {
  createProblem,
  updateProblem,
  deleteProblem,
  resetMutationState,
} from "../../features/problems/problemMutationSlice";

export const useProblemMutations = () => {
  const dispatch = useDispatch();
  const {
    creating,
    updating,
    deleting,
    error,
    successMessage,
  } = useSelector((state) => state.problemMutation);

  return {
    creating,
    updating,
    deleting,
    error,
    successMessage,
    createProblem: (data) => dispatch(createProblem(data)),
    updateProblem: (id, data) => dispatch(updateProblem({ id, data })),
    deleteProblem: (id) => dispatch(deleteProblem(id)),
    resetMutationState: () => dispatch(resetMutationState()),
  };
};
