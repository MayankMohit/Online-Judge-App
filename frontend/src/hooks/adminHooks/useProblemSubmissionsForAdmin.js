import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblemSubmissionsForAdmin } from "../../features/submissions/allSubmissionsOfProblemSlice";

export const useProblemSubmissionsForAdmin = (problemId) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(
    (state) => state.adminProblemSubmissions
  );

  useEffect(() => {
    if (problemId) {
      dispatch(fetchProblemSubmissionsForAdmin(problemId));
    }
  }, [dispatch, problemId]);

  return { submissions: items, loading, error };
};
