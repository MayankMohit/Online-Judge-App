import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSubmissionsForAdmin } from "../../features/submissions/userSubmissionsSlice";

export const useUserSubmissionsForAdmin = (userId) => {
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector((state) => state.userSubmissions);
  useEffect(() => {
    if (userId) dispatch(fetchUserSubmissionsForAdmin(userId));
  }, [dispatch, userId]);
  return { submissions: items, loading, error };
};
