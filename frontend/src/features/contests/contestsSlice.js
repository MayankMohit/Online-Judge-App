import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchContests = createAsyncThunk(
  "contests/fetchContests",
  async ({ status } = {}, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {};
      const res = await axios.get(`${BASE_URL}/api/contests`, {
        params,
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch contests"
      );
    }
  }
);

export const fetchContestById = createAsyncThunk(
  "contests/fetchContestById",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/contests/${contestId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch contest"
      );
    }
  }
);

export const registerForContest = createAsyncThunk(
  "contests/registerForContest",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/contests/${contestId}/register`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to register"
      );
    }
  }
);

export const unregisterFromContest = createAsyncThunk(
  "contests/unregisterFromContest",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/contests/${contestId}/register`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to unregister"
      );
    }
  }
);

const contestsSlice = createSlice({
  name: "contests",
  initialState: {
    items: [],
    currentContest: null,
    isRegistered: false,
    myStats: null,
    serverTimeOffset: 0,
    loading: false,
    detailLoading: false,
    registering: false,
    error: null,
  },
  reducers: {
    clearCurrentContest: (state) => {
      state.currentContest = null;
      state.isRegistered = false;
      state.myStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.contests;
        if (action.payload.serverTime) {
          state.serverTimeOffset = action.payload.serverTime - Date.now();
        }
      })
      .addCase(fetchContests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch contests";
      })

      .addCase(fetchContestById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchContestById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentContest = action.payload.contest;
        state.isRegistered = action.payload.isRegistered;
        state.myStats = action.payload.myStats;
        if (action.payload.serverTime) {
          state.serverTimeOffset = action.payload.serverTime - Date.now();
        }
      })
      .addCase(fetchContestById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || "Failed to fetch contest";
      })

      .addCase(registerForContest.pending, (state) => {
        state.registering = true;
      })
      .addCase(registerForContest.fulfilled, (state) => {
        state.registering = false;
        state.isRegistered = true;
        if (state.currentContest) state.currentContest.registeredCount += 1;
      })
      .addCase(registerForContest.rejected, (state, action) => {
        state.registering = false;
        state.error = action.payload || "Failed to register";
      })

      .addCase(unregisterFromContest.pending, (state) => {
        state.registering = true;
      })
      .addCase(unregisterFromContest.fulfilled, (state) => {
        state.registering = false;
        state.isRegistered = false;
        if (state.currentContest && state.currentContest.registeredCount > 0) {
          state.currentContest.registeredCount -= 1;
        }
      })
      .addCase(unregisterFromContest.rejected, (state, action) => {
        state.registering = false;
        state.error = action.payload || "Failed to unregister";
      });
  },
});

export const { clearCurrentContest } = contestsSlice.actions;
export default contestsSlice.reducer;
