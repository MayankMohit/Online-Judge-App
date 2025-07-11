import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const initialState = {
  items: [],        
  loading: false,
  error: null,
  page: 1,           
  hasMore: true,     
  searchQuery: "",  
  filters: {
    tag: "",
    difficulty: "",
    sort: "",
  }
}


export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async (_, { getState, rejectWithValue }) => {
    const { page, searchQuery, filters } = getState().problems;
    const { tag, difficulty, sort } = filters;

    const params = new URLSearchParams({
      page,
      limit: 20,
      query: searchQuery,
    });

    if (tag) params.append("tag", tag);
    if (difficulty) params.append("difficulty", difficulty);
    if (sort) params.append("sort", sort);

    try {
      const response = await axios.get(`${BASE_URL}/api/problems/search?${params.toString()}`);
      return response.data.problems;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch problems");
    }
  }
);


const problemsSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    incrementPage(state) {
      state.page += 1;
    },
    resetProblems(state) {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload;
        state.items = state.items[0]?.problemNumber === newItems[0]?.problemNumber ? state.items : [...state.items, ...newItems];
        state.hasMore = newItems.length === 20;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  incrementPage,
  resetProblems
} = problemsSlice.actions;

export default problemsSlice.reducer;
