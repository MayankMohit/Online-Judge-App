import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchSubmissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/user`);
      return res.data.submissions;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch submissions." });
    }
  }
);

const submissionsSlice = createSlice({
  name: "submissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch submissions.";
      });
  },
});

export default submissionsSlice.reducer;
