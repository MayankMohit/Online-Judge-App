import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProblem,
  clearAdminProblem,
} from "../../features/problems/adminProblemSlice";

export const useAdminProblem = (problemNumber) => {
  const dispatch = useDispatch();
  const { problem, loading, error } = useSelector((state) => state.adminProblem);

  useEffect(() => {
    if (problemNumber) dispatch(fetchAdminProblem(problemNumber));

    return () => dispatch(clearAdminProblem());
  }, [dispatch, problemNumber]);

  return { problem, loading, error };
};
