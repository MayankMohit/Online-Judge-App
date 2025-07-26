import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchSubmissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/user`);
      return res.data.submissions;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch submissions." }
      );
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  "submissions/fetchSubmissionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/submissions/${id}`);
      return response.data.submission;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch submission"
      );
    }
  }
);

const submissionsSlice = createSlice({
  name: "submissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentSubmission: null,
    currentLoading: false,
    currentError: null,
  },
  reducers: {
    clearCurrentSubmission(state) {
      state.currentSubmission = null;
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch submissions.";
      })

      .addCase(fetchSubmissionById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
        state.currentSubmission = null; // avoid stale data
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError =
          action.payload?.message || "Failed to fetch submission.";
      });
  },
});

export const { clearCurrentSubmission } = submissionsSlice.actions;
export default submissionsSlice.reducer;
