import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Fetch a specific tier hint
export const fetchHint = createAsyncThunk(
  "ai/fetchHint",
  async ({ problemId, tier }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/hint`,
        { problemId, tier },
        { withCredentials: true }
        );
      return { tier, hint: response.data.hint, unlockedUpTo: response.data.unlockedUpTo };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch hint");
    }
  }
);

// Fetch which tiers are already unlocked (on page load)
export const fetchUnlockedTiers = createAsyncThunk(
  "ai/fetchUnlockedTiers",
  async ({ problemId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/ai/hint/unlocked/${problemId}`,
        { withCredentials: true }
      );
      return response.data.unlockedUpTo;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch unlocked tiers");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    // hints[problemId][tier] = hint text
    hints: {},
    // unlockedUpTo[problemId] = 0 | 1 | 2 | 3
    unlockedUpTo: {},
    loading: false,
    error: null,
    // which tier is currently being fetched
    fetchingTier: null,
  },
  reducers: {
    clearHintsForProblem(state, action) {
      const problemId = action.payload;
      delete state.hints[problemId];
      delete state.unlockedUpTo[problemId];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHint.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.fetchingTier = action.meta.arg.tier;
      })
      .addCase(fetchHint.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchingTier = null;
        const { tier, hint, unlockedUpTo } = action.payload;
        const problemId = action.meta.arg.problemId;

        if (!state.hints[problemId]) state.hints[problemId] = {};
        state.hints[problemId][tier] = hint;
        state.unlockedUpTo[problemId] = unlockedUpTo;
      })
      .addCase(fetchHint.rejected, (state, action) => {
        state.loading = false;
        state.fetchingTier = null;
        state.error = action.payload;
      });

    builder
      .addCase(fetchUnlockedTiers.fulfilled, (state, action) => {
        const problemId = action.meta.arg.problemId;
        state.unlockedUpTo[problemId] = action.payload;
      });
  },
});

export const { clearHintsForProblem } = aiSlice.actions;
export default aiSlice.reducer;