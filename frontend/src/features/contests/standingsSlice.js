import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchStandings = createAsyncThunk(
  "standings/fetchStandings",
  async ({ contestId, page = 1, silent = false }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/contests/${contestId}/standings`,
        { params: { page }, withCredentials: true }
      );
      return { ...res.data, silent };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch standings"
      );
    }
  }
);

const standingsSlice = createSlice({
  name: "standings",
  initialState: {
    rows: [],
    myRow: null,
    problems: [],
    total: 0,
    page: 1,
    totalPages: 1,
    contestStatus: null,
    loading: false,
    refreshing: false,
    error: null,
  },
  reducers: {
    clearStandings: (state) => {
      state.rows = [];
      state.myRow = null;
      state.problems = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
      state.contestStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandings.pending, (state, action) => {
        // silent polls refresh in the background without a spinner
        if (action.meta.arg.silent) state.refreshing = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandings.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.rows = action.payload.standings;
        state.myRow = action.payload.myRow;
        state.problems = action.payload.problems;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.contestStatus = action.payload.contestStatus;
      })
      .addCase(fetchStandings.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || "Failed to fetch standings";
      });
  },
});

export const { clearStandings } = standingsSlice.actions;
export default standingsSlice.reducer;
