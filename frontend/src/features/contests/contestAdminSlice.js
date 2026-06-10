import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const createContest = createAsyncThunk(
  "contestAdmin/createContest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/contests`, payload, {
        withCredentials: true,
      });
      return res.data.contest;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create contest"
      );
    }
  }
);

export const updateContest = createAsyncThunk(
  "contestAdmin/updateContest",
  async ({ contestId, ...payload }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/contests/${contestId}`,
        payload,
        { withCredentials: true }
      );
      return res.data.contest;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update contest"
      );
    }
  }
);

export const deleteContest = createAsyncThunk(
  "contestAdmin/deleteContest",
  async (contestId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/contests/${contestId}`, {
        withCredentials: true,
      });
      return contestId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete contest"
      );
    }
  }
);

export const fetchContestForEdit = createAsyncThunk(
  "contestAdmin/fetchContestForEdit",
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

const contestAdminSlice = createSlice({
  name: "contestAdmin",
  initialState: {
    contest: null,
    serverTimeOffset: 0,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearAdminContest: (state) => {
      state.contest = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContestForEdit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestForEdit.fulfilled, (state, action) => {
        state.loading = false;
        state.contest = action.payload.contest;
        if (action.payload.serverTime) {
          state.serverTimeOffset = action.payload.serverTime - Date.now();
        }
      })
      .addCase(fetchContestForEdit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch contest";
      })

      .addCase(createContest.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createContest.fulfilled, (state, action) => {
        state.saving = false;
        state.contest = action.payload;
      })
      .addCase(createContest.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to create contest";
      })

      .addCase(updateContest.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateContest.fulfilled, (state, action) => {
        state.saving = false;
        state.contest = action.payload;
      })
      .addCase(updateContest.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update contest";
      })

      .addCase(deleteContest.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteContest.fulfilled, (state) => {
        state.saving = false;
        state.contest = null;
      })
      .addCase(deleteContest.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to delete contest";
      });
  },
});

export const { clearAdminContest } = contestAdminSlice.actions;
export default contestAdminSlice.reducer;
