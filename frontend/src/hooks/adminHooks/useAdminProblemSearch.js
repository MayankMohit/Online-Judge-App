import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const useAdminProblemSearch = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch problems from server
  const fetchProblems = useCallback(async (query, pageNum = 1, append = false) => {
    if (!query) {
      setProblems([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        query,
      });

      const { data } = await axios.get(
        `${BASE_URL}/api/problems/search?${params.toString()}`,
        { withCredentials: true }
      );

      const fetched = data.problems || [];
      setProblems((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(fetched.length === 10);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update search
  const updateSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setPage(1);
      fetchProblems(query, 1, false);
    },
    [fetchProblems]
  );

  // Load more problems
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProblems(searchQuery, nextPage, true);
  }, [fetchProblems, page, searchQuery]);

  // Refetch when searchQuery or page changes (if needed)
  useEffect(() => {
    if (searchQuery) {
      fetchProblems(searchQuery, page, page > 1);
    }
  }, [searchQuery, page, fetchProblems]);

  return { problems, loading, error, updateSearch, loadMore, hasMore };
};
