import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Run Code Thunk
export const runCode = createAsyncThunk(
  "code/run",
  async ({code, language, input}, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/run/`, {code, language, input});
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Run failed" }
      );
    }
  }
);

// 🔹 Submit Code Thunk
export const submitCode = createAsyncThunk(
  "code/submit",
  async ({ problemId, code, language }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/submissions/`, {
        problemId,
        code,
        language,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Submit failed" }
      );
    }
  }
);

const codeSlice = createSlice({
  name: "code",
  initialState: {
    loading: false,
    output: "",
    error: null,
    time: null,
    verdict: "",
    failedCase: null,
    averageTime: null,
  },
  reducers: {
    clearCodeState: (state) => {
      state.loading = false;
      state.output = "";
      state.error = null;
      state.time = null;
      state.verdict = "";
      state.failedCase = null;
      state.averageTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // RUN
      .addCase(runCode.pending, (state) => {
        state.loading = true;
        state.output = "";
        state.error = null;
        state.time = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        const { success, output, error, time } = action.payload;
        state.loading = false;
        state.output = output || "";
        state.error = error || null;
        state.time = time || null;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.loading = false;
        state.output = "";
        state.error = action.payload?.error || "Run failed";
      })

      // SUBMIT
      .addCase(submitCode.pending, (state) => {
        state.loading = true;
        state.verdict = "";
        state.failedCase = null;
        state.averageTime = null;
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        const { verdict, averageTime, failedCase } = action.payload;
        state.loading = false;
        state.verdict = verdict;
        state.averageTime = averageTime;
        state.failedCase = failedCase || null;
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.loading = false;
        state.verdict = "";
        state.failedCase = null;
        state.averageTime = null;
        state.error = action.payload?.error || "Submit failed";
      });
  },
});

export const { clearCodeState } = codeSlice.actions;
export default codeSlice.reducer;
