import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/dashboard`); 
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    loading: false,
    error: null,
    name: "",
    email: "",
    lastLogin: "",
    totalProblemsSolved: 0,
    submissions: [],
    difficultyStats: { Easy: 0, Medium: 0, Hard: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.lastLogin = action.payload.lastLogin;
        state.totalProblemsSolved = action.payload.totalProblemsSolved;
        state.submissions = action.payload.submissions;
        state.difficultyStats = action.payload.difficultyStats;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
