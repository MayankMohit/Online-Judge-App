import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUserDashboard,
  clearAdminUserDashboard,
} from "../../features/dashboard/adminUserDashboardSlice";

export const useAdminUserDashboard = (userId) => {
  const dispatch = useDispatch();

  const { userData, submissionsList, problemsList, loading, error } =
    useSelector((state) => state.adminUserDashboard);

  const refetch = useCallback(() => {
    if (userId) dispatch(fetchAdminUserDashboard(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    refetch();
    return () => {
      dispatch(clearAdminUserDashboard());
    };
  }, [refetch]);

  return { userData, submissionsList, problemsList, loading, error, refetch };
};