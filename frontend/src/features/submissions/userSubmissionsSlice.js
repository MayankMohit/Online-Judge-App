import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchUserSubmissionsForAdmin = createAsyncThunk(
  "submissions/fetchUserSubmissionsForAdmin",
  async (userId, thunkAPI) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/submissions/user/${userId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const userSubmissionsSlice = createSlice({
  name: "userSubmissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSubmissionsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubmissionsForAdmin.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload;
      })
      .addCase(fetchUserSubmissionsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSubmissionsSlice.reducer;
