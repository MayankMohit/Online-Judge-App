import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUserDashboard,
  clearAdminUserDashboard,
} from "../../features/dashboard/adminUserDashboardSlice";

export const useAdminUserDashboard = (userId) => {
  const dispatch = useDispatch();

  const {
    userData,
    submissionsList,
    problemsList,
    loading,
    error,
  } = useSelector((state) => state.adminUserDashboard);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAdminUserDashboard(userId));
    }

    return () => {
      dispatch(clearAdminUserDashboard());
    };
  }, [dispatch, userId]);

  return {
    userData,
    submissionsList,
    problemsList,
    loading,
    error,
  };
};
