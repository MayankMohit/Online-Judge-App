import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;

export const createProblem = createAsyncThunk(
  "problem/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/problems`, data);
      return res.data.problem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Create failed");
    }
  }
);

export const updateProblem = createAsyncThunk(
  "problem/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/problems/${id}`, data);
      return res.data.problem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const deleteProblem = createAsyncThunk(
  "problem/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/problems/${id}`);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

const problemMutationSlice = createSlice({
  name: "problemMutation",
  initialState: {
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    resetMutationState: (state) => {
      state.creating = false;
      state.updating = false;
      state.deleting = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createProblem.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProblem.fulfilled, (state) => {
        state.creating = false;
        state.successMessage = "Problem created successfully";
      })
      .addCase(createProblem.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateProblem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProblem.fulfilled, (state) => {
        state.updating = false;
        state.successMessage = "Problem updated successfully";
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteProblem.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProblem.fulfilled, (state) => {
        state.deleting = false;
        state.successMessage = "Problem deleted successfully";
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { resetMutationState } = problemMutationSlice.actions;
export default problemMutationSlice.reducer;
