import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetch",
  async (
    { search = "", role = "", sort = "solved_desc", page = 1, limit = 5, append = false },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (sort) params.append("sort", sort);
      params.append("page", page);
      params.append("limit", limit);

      const { data } = await axios.get(
        `${BASE_URL}/api/users/search?${params.toString()}`,
        { withCredentials: true }
      );

      return {
        users: data.users,
        total: data.total || 0,
        append,
        page,
        limit,
        search,
        role,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    filteredUsers: [],
    visibleCount: 5,
    loading: false,
    error: null,
    currentPage: 1,
    hasMore: true,
    totalUsers: 0,
    search: "",
    role: "",
  },
  reducers: {
    resetAdminUsers(state) {
      state.users = [];
      state.filteredUsers = [];
      state.visibleCount = 5;
      state.loading = false;
      state.error = null;
      state.currentPage = 1;
      state.hasMore = true;
      state.totalUsers = 0;
      state.search = "";
      state.role = "";
    },
    increaseVisibleCount(state) {
      state.visibleCount += 5;
      state.hasMore = state.visibleCount < state.filteredUsers.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        const { users, append, page, limit, total, search, role } = action.payload;
        state.loading = false;
        state.search = search;
        state.role = role;
        state.totalUsers = total;

        const isFilterActive = search || role;

        if (isFilterActive) {
          state.filteredUsers = users;
          state.visibleCount = 5;
          state.hasMore = users.length > 5;
        } else {
          if (append) {
            state.users = [...state.users, ...users];
          } else {
            state.users = users;
          }
          state.currentPage = page;
          state.hasMore = page * limit < total;
        }
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminUsers, increaseVisibleCount } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;