import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers, increaseVisibleCount } from "../../features/user/adminUsersSlice";
import { useCallback } from "react";

export const useAdminUsers = () => {
  const dispatch = useDispatch();
  const {
    users,
    filteredUsers,
    visibleCount,
    loading,
    error,
    hasMore,
    currentPage,
    search,
    role,
  } = useSelector((state) => state.adminUsers);

  const isFiltered = !!(search || role);

  const fetchUsers = useCallback(
    (params = { search: "", role: "", sort: "solved_desc", page: 1, limit: 5 }) => {
      dispatch(fetchAdminUsers(params));
    },
    [dispatch]
  );

  const loadMore = useCallback(
    (params = { search: "", role: "", sort: "solved_desc", limit: 5 }) => {
      if (isFiltered) {
        dispatch(increaseVisibleCount());
      } else {
        dispatch(fetchAdminUsers({ ...params, page: currentPage + 1, append: true }));
      }
    },
    [dispatch, currentPage, isFiltered]
  );

  const visibleUsers = isFiltered ? filteredUsers.slice(0, visibleCount) : users;

  return {
    users: visibleUsers,
    loading,
    error,
    fetchUsers,
    loadMore,
    hasMore: isFiltered ? visibleCount < filteredUsers.length : hasMore,
    currentPage,
  };
};