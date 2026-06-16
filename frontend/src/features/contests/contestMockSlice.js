import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const startMock = createAsyncThunk(
  "contestMock/start",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/contests/${contestId}/mock/start`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to start mock"
      );
    }
  }
);

export const fetchMyMock = createAsyncThunk(
  "contestMock/fetchMine",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/contests/${contestId}/mock/me`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch mock"
      );
    }
  }
);

export const resetMock = createAsyncThunk(
  "contestMock/reset",
  async (contestId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/contests/${contestId}/mock`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset mock"
      );
    }
  }
);

const applyServerTime = (state, payload) => {
  if (payload?.serverTime) {
    state.serverTimeOffset = payload.serverTime - Date.now();
  }
};

const contestMockSlice = createSlice({
  name: "contestMock",
  initialState: {
    mock: null,
    contest: null, // { _id, title, problems } for banner context
    serverTimeOffset: 0,
    loading: false,
    starting: false,
    error: null,
  },
  reducers: {
    clearMock: (state) => {
      state.mock = null;
      state.contest = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMock.fulfilled, (state, action) => {
        state.loading = false;
        state.mock = action.payload.mock;
        state.contest = action.payload.contest;
        applyServerTime(state, action.payload);
      })
      .addCase(fetchMyMock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch mock";
      })

      .addCase(startMock.pending, (state) => {
        state.starting = true;
        state.error = null;
      })
      .addCase(startMock.fulfilled, (state, action) => {
        state.starting = false;
        state.mock = action.payload.mock;
        applyServerTime(state, action.payload);
      })
      .addCase(startMock.rejected, (state, action) => {
        state.starting = false;
        state.error = action.payload || "Failed to start mock";
      })

      .addCase(resetMock.fulfilled, (state) => {
        state.mock = null;
      });
  },
});

export const { clearMock } = contestMockSlice.actions;
export default contestMockSlice.reducer;
