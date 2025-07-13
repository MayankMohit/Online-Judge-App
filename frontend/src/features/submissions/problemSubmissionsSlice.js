import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchSubmissionsByProblem = createAsyncThunk(
  "problemSubmissions/fetchByProblem",
  async (problemId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/user/problem/${problemId}`);
      return res.data.submissions;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch problem submissions." });
    }
  }
);

const problemSubmissionsSlice = createSlice({
  name: "problemSubmissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProblemSubmissions: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissionsByProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionsByProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubmissionsByProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch problem submissions.";
      });
  },
});

export const { clearProblemSubmissions } = problemSubmissionsSlice.actions;
export default problemSubmissionsSlice.reducer;
