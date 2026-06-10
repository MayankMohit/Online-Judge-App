import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchMyContestHistory = createAsyncThunk(
  "contestHistory/fetchMyContestHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/contests/history/me`, {
        withCredentials: true,
      });
      return res.data.history;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch contest history"
      );
    }
  }
);

const contestHistorySlice = createSlice({
  name: "contestHistory",
  initialState: {
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyContestHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyContestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchMyContestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch contest history";
      });
  },
});

export default contestHistorySlice.reducer;
