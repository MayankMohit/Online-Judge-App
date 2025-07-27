import { useDispatch, useSelector } from "react-redux";
import { fetchProblemsByAdmin, createProblem, updateProblem, deleteProblem } from "../../features/problems/adminProblemsSlice";

export const useAdminProblems = () => {
  const dispatch = useDispatch();
  const { problems, loading, error, success } = useSelector((state) => state.adminProblems);

  return {
    problems,
    loading,
    error,
    success,
    fetchByAdmin: (id) => dispatch(fetchProblemsByAdmin(id)),
    create: (data) => dispatch(createProblem(data)),
    update: (id, data) => dispatch(updateProblem({ id, updatedData: data })),
    remove: (id) => dispatch(deleteProblem(id)),
  };
};
