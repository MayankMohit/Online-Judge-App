import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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

export const fetchUnlockedTiers = createAsyncThunk(
  "ai/fetchUnlockedTiers",
  async ({ problemId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/ai/hint/unlocked/${problemId}`,
        { withCredentials: true }
      );
      return { unlockedUpTo: response.data.unlockedUpTo, hints: response.data.hints || {} };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch unlocked tiers");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    hints: {},
    unlockedUpTo: {},
    loading: false,
    error: null,
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
        const { unlockedUpTo, hints } = action.payload;
        state.unlockedUpTo[problemId] = unlockedUpTo;
        // Hydrate previously saved hints so they render immediately on revisit
        if (hints && Object.keys(hints).length > 0) {
          if (!state.hints[problemId]) state.hints[problemId] = {};
          Object.entries(hints).forEach(([tier, hint]) => {
            state.hints[problemId][tier] = hint;
          });
        }
      });
  },
});

export const { clearHintsForProblem } = aiSlice.actions;
export default aiSlice.reducer;