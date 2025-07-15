import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Fetch saved code
export const fetchSavedCode = createAsyncThunk(
  "codePersistence/fetchSavedCode",
  async ({ problemId, language }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/code/${problemId}/${language}`,
        { withCredentials: true }
      );
      return { problemId, language, code: res.data.code || "" };
    } catch (err) {
      return thunkAPI.rejectWithValue({
        error: err.response?.data?.message || "Failed to fetch code",
      });
    }
  }
);

// 🔹 Save code
export const saveCodeToDB = createAsyncThunk(
  "codePersistence/saveCodeToDB",
  async ({ problemId, language, code }, thunkAPI) => {
    try {
      await axios.post(
        `${BASE_URL}/api/code/save`,
        { problemId, language, code },
        { withCredentials: true }
      );
      return { problemId, language, code };
    } catch (err) {
      return thunkAPI.rejectWithValue({
        error: err.response?.data?.message || "Failed to save code",
      });
    }
  }
);

const codePersistenceSlice = createSlice({
  name: "codePersistence",
  initialState: {
    codeMap: {}, // { [problemId]: { [language]: code } }
    loading: false,
    saving: false,
    saveSuccess: false,
    error: null,
  },
  reducers: {
    updateCodeLocally: (state, action) => {
      const { problemId, language, code } = action.payload;
      if (!state.codeMap[problemId]) {
        state.codeMap[problemId] = {};
      }
      state.codeMap[problemId][language] = code;
    },
    clearSaveSuccess: (state) => {
      state.saveSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedCode.fulfilled, (state, action) => {
        const { problemId, language, code } = action.payload;
        state.loading = false;
        if (!state.codeMap[problemId]) {
          state.codeMap[problemId] = {};
        }
        state.codeMap[problemId][language] = code;
      })
      .addCase(fetchSavedCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Unknown fetch error";
      })

      .addCase(saveCodeToDB.pending, (state) => {
        state.saving = true;
        state.saveSuccess = false;
      })
      .addCase(saveCodeToDB.fulfilled, (state, action) => {
        const { problemId, language, code } = action.payload;
        if (!state.codeMap[problemId]) {
          state.codeMap[problemId] = {};
        }
        state.codeMap[problemId][language] = code;
        state.saving = false;
        state.saveSuccess = true;
      })
      .addCase(saveCodeToDB.rejected, (state, action) => {
        state.saving = false;
        state.saveSuccess = false;
        state.error = action.payload?.error || "Save failed";
      });
  },
});

export const { updateCodeLocally, clearSaveSuccess } = codePersistenceSlice.actions;
export default codePersistenceSlice.reducer;
