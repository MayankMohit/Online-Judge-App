import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../../hooks/adminHooks/adminUsersHooks";

export default function AdminUserList() {
  const navigate = useNavigate();
  const { users, loading, error, fetchUsers, loadMore, hasMore } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    fetchUsers({ search: "", role: "", sort: "solved_desc", page: 1, limit: LIMIT });
    setPage(1);
  }, [fetchUsers]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers({ search: searchTerm, role: roleFilter, sort: "solved_desc", page: 1, limit: LIMIT });
      setPage(1);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, roleFilter, fetchUsers]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    loadMore({ search: searchTerm, role: roleFilter, sort: "solved_desc", page: nextPage, limit: LIMIT });
    setPage(nextPage);
  }, [loadMore, searchTerm, roleFilter, page]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Users</h2>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-grow items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500 transition-colors">
          <Search size={15} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent text-sm text-white w-full px-2 focus:outline-none placeholder-zinc-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading && users.length === 0 && (
        <p className="text-zinc-500 text-sm">Loading users...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Users list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[36vh] pr-1 custom-scrollbar">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/admin/users/${user._id}`)}
            className="px-3 py-2.5 rounded-xl cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition flex justify-between items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-white truncate">{user.name}</p>
                {user.role === "admin" && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-sm font-semibold text-purple-400">{user.totalProblemsSolved}</p>
              <p className="text-xs text-zinc-600">solved</p>
            </div>
          </div>
        ))}

        {users.length === 0 && !loading && (
          <p className="text-zinc-500 text-sm text-center py-4">No users found</p>
        )}

        {hasMore && !loading && (
          <button
            onClick={handleLoadMore}
            className="flex items-center justify-center gap-1 py-2 text-xs text-zinc-400 hover:text-white transition"
          >
            <ChevronDown size={14} />
            Load more
          </button>
        )}
        {loading && users.length > 0 && (
          <p className="text-zinc-500 text-xs text-center py-2">Loading...</p>
        )}
      </div>
    </div>
  );
}