import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAdminProblem = createAsyncThunk(
  "adminProblem/fetchAdminProblem",
  async (problemNumber, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/problems/${problemNumber}`);
      return res.data.problem;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch problem"
      );
    }
  }
);

const adminProblemSlice = createSlice({
  name: "adminProblem",
  initialState: {
    problem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminProblem(state) {
      state.problem = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProblem.fulfilled, (state, action) => {
        state.problem = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminProblem } = adminProblemSlice.actions;
export default adminProblemSlice.reducer;
