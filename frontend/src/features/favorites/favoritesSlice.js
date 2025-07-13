import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;


export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (problemId, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/api/problems/${problemId}/favorite`);
      return problemId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to add favorite" });
    }
  }
);

// REMOVE from favorites
export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (problemId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/problems/${problemId}/favorite`);
      return problemId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to remove favorite" });
    }
  }
);

export const fetchFavoriteProblems = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/favorites`);
      return res.data.favorites;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

// Slice
const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    favoriteProblemIds: [], 
    favoriteProblems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFavorites: (state, action) => {
      state.favoriteProblemIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProblemIds.push(action.payload);
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProblemIds = state.favoriteProblemIds.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(fetchFavoriteProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProblems = action.payload;
        state.favoriteProblemIds = action.payload.map(p => p._id);
      })
      .addCase(fetchFavoriteProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;