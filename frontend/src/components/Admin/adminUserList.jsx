import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../../hooks/adminHooks/adminUsersHooks";

export default function AdminUserList() {
  const navigate = useNavigate();
  const { users, loading, error, fetchUsers, loadMore, hasMore, currentPage } = useAdminUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // "", "user", "admin"
  const [limit, setLimit] = useState(5);

  // **Initial fetch (Top 5 users)**
  useEffect(() => {
    fetchUsers({ search: "", role: "", sort: "solved_desc", page: 1, limit: 5 });
  }, [fetchUsers]);

  // **Fetch when search/role changes**
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const newLimit = searchTerm || roleFilter ? 5 : 5;
      setLimit(newLimit);
      fetchUsers({
        search: searchTerm,
        role: roleFilter,
        sort: "solved_desc",
        page: 1,
        limit: newLimit,
      });
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, roleFilter, fetchUsers]);

  // **Load More**
  const handleLoadMore = useCallback(() => {
    loadMore({
      search: searchTerm,
      role: roleFilter,
      sort: "solved_desc",
      limit: 10,
    });
  }, [loadMore, searchTerm, roleFilter]);

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 shadow-md flex flex-col gap-3 h-[46.7vh]">
      <h2 className="text-xl font-semibold text-purple-300">Users</h2>

      {/* Search + Role Filter */}
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

      {loading && users.length === 0 && (
        <p className="text-gray-400 text-sm">Loading users...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Users List */}
      <div className="flex flex-col gap-2 overflow-y-auto h-[28vh] pr-1 custom-scrollbar">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/admin/users/${user._id}`)}
            className="px-3 py-2 rounded-md cursor-pointer bg-gray-900 hover:bg-gray-900/50 transition flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <p className="text-sm text-purple-300 font-semibold">
              Solved: {user.totalProblemsSolved}
            </p>
          </div>
        ))}
        {users.length === 0 && !loading && (
          <p className="text-gray-400 text-sm">No users found.</p>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          className="mt-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Load More
        </button>
      )}
      {loading && users.length > 0 && (
        <p className="text-gray-400 text-xs">Loading more...</p>
      )}
    </div>
  );
}
