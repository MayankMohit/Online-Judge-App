import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../../hooks/adminHooks/adminUsersHooks";

export default function AdminUserList() {
  const navigate = useNavigate();
  const { users, loading, error, fetchUsers, loadMore, hasMore } =
    useAdminUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const LIMIT = 10;

  // Initial fetch
  useEffect(() => {
    fetchUsers({
      search: "",
      role: "",
      sort: "solved_desc",
      page: 1,
      limit: LIMIT,
    });
    setPage(1);
  }, [fetchUsers]);

  // Debounced Search/Filter
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers({
        search: searchTerm,
        role: roleFilter,
        sort: "solved_desc",
        page: 1,
        limit: LIMIT,
      });
      setPage(1); // reset pagination on new filter
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, roleFilter, fetchUsers]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    loadMore({
      search: searchTerm,
      role: roleFilter,
      sort: "solved_desc",
      page: nextPage,
      limit: LIMIT,
    });
    setPage(nextPage);
  }, [loadMore, searchTerm, roleFilter, page]);

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 shadow-md flex flex-col gap-3 h-[45.5vh]">
      <h2 className="text-xl font-semibold text-purple-300">Users</h2>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-grow items-center bg-gray-700 rounded-md px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent text-sm text-white w-full px-2 focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Loader / Error */}
      {loading && users.length === 0 && (
        <p className="text-gray-400 text-sm">Loading users...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Scrollable Users List */}
      <div className="flex flex-col gap-2 overflow-y-auto h-[28vh] pr-1 custom-scrollbar">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/admin/users/${user._id}`)}
            className="px-3 py-2 rounded-md cursor-pointer bg-gray-900 hover:bg-gray-900/50 transition flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.name}</p>
                {user.role === "admin" && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-green-900/40 text-green-400`}
                  >
                    Admin
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <p className="text-sm text-purple-300 font-semibold">
              Solved: {user.totalProblemsSolved}
            </p>
          </div>
        ))}

        {/* Empty state */}
        {users.length === 0 && !loading && (
          <p className="text-gray-400 text-sm">No users found.</p>
        )}

        {/* Load More Button inside list */}
        {hasMore && !loading && (
          <button
            onClick={handleLoadMore}
            className="px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-md self-center"
          >
            Load More
          </button>
        )}
        {loading && users.length > 0 && (
          <p className="text-gray-400 text-xs self-center">Loading more...</p>
        )}
      </div>
    </div>
  );
}
