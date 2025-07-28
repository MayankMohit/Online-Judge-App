// features/adminSubmissions/adminProblemSubmissionsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchProblemSubmissionsForAdmin = createAsyncThunk(
  "adminProblemSubmissions/fetch",
  async (problemId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/problem/${problemId}`);
      return res.data.submissions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

const adminProblemSubmissionsSlice = createSlice({
  name: "adminProblemSubmissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblemSubmissionsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemSubmissionsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProblemSubmissionsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminProblemSubmissionsSlice.reducer;
