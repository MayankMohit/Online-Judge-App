import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers } from "../../features/user/adminUsersSlice";
import { useCallback } from "react";

export const useAdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error, hasMore, currentPage } = useSelector(
    (state) => state.adminUsers
  );

  // Fetch users (first page or search/filter)
  const fetchUsers = useCallback(
    (params = { search: "", role: "", sort: "solved_desc", page: 1, limit: 5 }) => {
      dispatch(fetchAdminUsers(params));
    },
    [dispatch]
  );

  // Load more users
  const loadMore = useCallback(
    (params = { search: "", role: "", sort: "solved_desc", limit: 5 }) => {
      dispatch(fetchAdminUsers({ ...params, page: currentPage + 1, append: true }));
    },
    [dispatch, currentPage]
  );

  return { users, loading, error, fetchUsers, loadMore, hasMore, currentPage };
};
