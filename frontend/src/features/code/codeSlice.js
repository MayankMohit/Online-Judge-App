import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Run Code Thunk
export const runCode = createAsyncThunk(
  "code/run",
  async ({ code, language, input }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/run/`, { code, language, input });
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

const initialState = {
  loading: false,
  lastAction: "", // "run" or "submit"
  output: "",
  error: null,
  time: null,
  verdict: "",
  failedCase: null,
  averageTime: null,
};

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    clearCodeState: () => ({
      ...initialState, // Ensures full reset
    }),
  },
  extraReducers: (builder) => {
    builder
      // RUN
      .addCase(runCode.pending, (state) => {
        state.loading = true;
        state.lastAction = "run";
        state.output = "";
        state.error = null;
        state.time = null;
        state.verdict = "";
        state.failedCase = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        const { output, error, time } = action.payload;
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
        state.lastAction = "submit";
        state.verdict = "";
        state.failedCase = null;
        state.averageTime = null;
        state.output = ""; // Clear run output
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        const { verdict, averageTime, failedCase, error } = action.payload;
        state.loading = false;
        state.verdict = verdict || "";
        state.failedCase = failedCase || null;
        state.averageTime = averageTime || null;
        state.error = error || null;
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
