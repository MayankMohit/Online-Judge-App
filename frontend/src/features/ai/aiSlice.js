import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Hints ────────────────────────────────────────────────────────────────────

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

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const fetchCodeFeedback = createAsyncThunk(
  "ai/fetchCodeFeedback",
  async ({ submissionId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/feedback`,
        { submissionId },
        { withCredentials: true }
      );
      console.log("Received feedback:", response.data.feedback);
      return { submissionId, feedback: response.data.feedback };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    // Hints
    hints: {},           // hints[problemId][tier] = hint text
    unlockedUpTo: {},    // unlockedUpTo[problemId] = 0 | 1 | 2 | 3
    hintLoading: false,
    hintError: null,
    fetchingTier: null,

    // Feedback
    feedbackLoading: false,
    feedbackError: null,
    currentFeedback: null,
  },
  reducers: {
    clearHintsForProblem(state, action) {
      const problemId = action.payload;
      delete state.hints[problemId];
      delete state.unlockedUpTo[problemId];
      state.hintError = null;
    },
    clearFeedbackError(state) {
      state.feedbackError = null;
    },
    clearFeedback(state) {
      state.currentFeedback = null;
      state.feedbackError = null;
    }
  },
  extraReducers: (builder) => {
    // Hints
    builder
      .addCase(fetchHint.pending, (state, action) => {
        state.hintLoading = true;
        state.hintError = null;
        state.fetchingTier = action.meta.arg.tier;
      })
      .addCase(fetchHint.fulfilled, (state, action) => {
        state.hintLoading = false;
        state.fetchingTier = null;
        const { tier, hint, unlockedUpTo } = action.payload;
        const problemId = action.meta.arg.problemId;
        if (!state.hints[problemId]) state.hints[problemId] = {};
        state.hints[problemId][tier] = hint;
        state.unlockedUpTo[problemId] = unlockedUpTo;
      })
      .addCase(fetchHint.rejected, (state, action) => {
        state.hintLoading = false;
        state.fetchingTier = null;
        state.hintError = action.payload;
      });

    builder
      .addCase(fetchUnlockedTiers.fulfilled, (state, action) => {
        const problemId = action.meta.arg.problemId;
        const { unlockedUpTo, hints } = action.payload;
        state.unlockedUpTo[problemId] = unlockedUpTo;
        if (hints && Object.keys(hints).length > 0) {
          if (!state.hints[problemId]) state.hints[problemId] = {};
          Object.entries(hints).forEach(([tier, hint]) => {
            state.hints[problemId][tier] = hint;
          });
        }
      });

    // Feedback
    builder
      .addCase(fetchCodeFeedback.pending, (state) => {
        state.feedbackLoading = true;
        state.feedbackError = null;
      })
      .addCase(fetchCodeFeedback.fulfilled, (state, action) => {
        state.feedbackLoading = false;
        state.currentFeedback = action.payload.feedback;
      })
      .addCase(fetchCodeFeedback.rejected, (state, action) => {
        state.feedbackLoading = false;
        state.feedbackError = action.payload;
      });
  },
});

export const { clearHintsForProblem, clearFeedbackError } = aiSlice.actions;
export default aiSlice.reducer;