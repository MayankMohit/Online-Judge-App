import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Fetch all problems created by a specific admin
export const fetchProblemsByAdmin = createAsyncThunk(
  "adminProblems/fetchByAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/problems/admin/${adminId}`,
        { withCredentials: true }
      );
      return data.problems;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch problems by admin"
      );
    }
  }
);

// Create a new problem
export const createProblem = createAsyncThunk(
  "adminProblems/createProblem",
  async (problemData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/problems`,
        problemData,
        { withCredentials: true }
      );
      return data.problem;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create problem"
      );
    }
  }
);

// Update an existing problem
export const updateProblem = createAsyncThunk(
  "adminProblems/updateProblem",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/problems/${id}`,
        updatedData,
        { withCredentials: true }
      );
      return data.problem;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update problem"
      );
    }
  }
);

// Delete a problem
export const deleteProblem = createAsyncThunk(
  "adminProblems/deleteProblem",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/problems/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete problem"
      );
    }
  }
);

const adminProblemsSlice = createSlice({
  name: "adminProblems",
  initialState: {
    problems: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    resetAdminProblems(state) {
      state.problems = [];
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Problems
      .addCase(fetchProblemsByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemsByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
      })
      .addCase(fetchProblemsByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Problem
      .addCase(createProblem.pending, (state) => {
        state.loading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(createProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Problem created successfully";
        state.problems.unshift(action.payload);
      })
      .addCase(createProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Problem
      .addCase(updateProblem.pending, (state) => {
        state.loading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(updateProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Problem updated successfully";
        const index = state.problems.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.problems[index] = action.payload;
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Problem
      .addCase(deleteProblem.pending, (state) => {
        state.loading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Problem deleted successfully";
        state.problems = state.problems.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminProblems } = adminProblemsSlice.actions;
export default adminProblemsSlice.reducer;
