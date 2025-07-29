import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchProblemsByAdmin,
  createProblem,
  updateProblem,
  deleteProblem,
} from "../../features/problems/adminProblemsSlice";

export const useAdminProblems = () => {
  const dispatch = useDispatch();
  const { problems, loading, error, success } = useSelector(
    (state) => state.adminProblems
  );

  const fetchByAdmin = useCallback(
    (id) => dispatch(fetchProblemsByAdmin(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => dispatch(createProblem(data)),
    [dispatch]
  );

  const update = useCallback(
    (id, data) => dispatch(updateProblem({ id, updatedData: data })),
    [dispatch]
  );

  const remove = useCallback(
    (id) => dispatch(deleteProblem(id)),
    [dispatch]
  );

  return {
    problems,
    loading,
    error,
    success,
    fetchByAdmin,
    create,
    update,
    remove,
  };
};

