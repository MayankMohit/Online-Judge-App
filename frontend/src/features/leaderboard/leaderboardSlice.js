import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchLeaderboard = createAsyncThunk(
  "leaderboard/fetchLeaderboard",
  async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/users/leaderboard`);
        console.log(res.data.users);
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch leaderboard");
    }
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch leaderboard";
      });
  },
});

export default leaderboardSlice.reducer;
