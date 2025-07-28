import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAdminUserDashboard = createAsyncThunk(
  "adminUserDashboard/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/dashboard/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch user dashboard");
    }
  }
);

const adminUserDashboardSlice = createSlice({
  name: "adminUserDashboard",
  initialState: {
    userData: null,
    submissionsList: [],
    problemsList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminUserDashboard: (state) => {
      state.userData = null;
      state.submissionsList = [];
      state.problemsList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUserDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.userData;
        state.submissionsList = action.payload.submissionsList;
        state.problemsList = action.payload.problemsList;
      })
      .addCase(fetchAdminUserDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminUserDashboard } = adminUserDashboardSlice.actions;
export default adminUserDashboardSlice.reducer;
