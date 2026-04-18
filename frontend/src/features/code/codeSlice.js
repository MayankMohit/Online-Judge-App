import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Run a single test case
export const runCode = createAsyncThunk(
  "code/run",
  async ({ code, language, input }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/run/`, { code, language, input });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { error: "Run failed" });
    }
  }
);

// Run all test cases in parallel
export const runAllTestCases = createAsyncThunk(
  "code/runAll",
  async ({ code, language, testCases }, thunkAPI) => {
    try {
      const results = await Promise.all(
        testCases.map((tc) =>
          axios
            .post(`${BASE_URL}/api/run/`, { code, language, input: tc.input || "" })
            .then((res) => res.data)
            .catch((err) => ({ success: false, error: err.response?.data?.error || "Run failed", output: null, time: null }))
        )
      );
      return results;
    } catch (err) {
      return thunkAPI.rejectWithValue({ error: "Run failed" });
    }
  }
);

// Submit code
export const submitCode = createAsyncThunk(
  "code/submit",
  async ({ problemId, code, language }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/submissions/`, { problemId, code, language });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { error: "Submit failed" });
    }
  }
);

const initialState = {
  loading: false,
  lastAction: "", // "run" | "runAll" | "submit"
  // Single run result (legacy, still used for submit)
  output: "",
  error: null,
  time: null,
  // Submit result
  verdict: "",
  failedCase: null,
  averageTime: null,
  submissionId: null,
  // Multi test case results: array of { output, error, time }
  testCaseResults: [],
};

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    clearCodeState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      // Single RUN
      .addCase(runCode.pending, (state) => {
        state.loading = true;
        state.lastAction = "run";
        state.output = "";
        state.error = null;
        state.time = null;
        state.verdict = "";
        state.failedCase = null;
        state.testCaseResults = [];
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
        state.error = action.payload?.error || "Run failed";
      })

      // RUN ALL
      .addCase(runAllTestCases.pending, (state) => {
        state.loading = true;
        state.lastAction = "runAll";
        state.testCaseResults = [];
        state.verdict = "";
        state.failedCase = null;
        state.output = "";
        state.error = null;
      })
      .addCase(runAllTestCases.fulfilled, (state, action) => {
        state.loading = false;
        state.testCaseResults = action.payload.map((r) => ({
          output: r.output ?? null,
          error: r.error ?? null,
          time: r.time ?? null,
        }));
      })
      .addCase(runAllTestCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Run failed";
      })

      // SUBMIT
      .addCase(submitCode.pending, (state) => {
        state.submissionId = null;
        state.loading = true;
        state.lastAction = "submit";
        state.verdict = "";
        state.failedCase = null;
        state.averageTime = null;
        state.output = "";
        state.testCaseResults = [];
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        const { verdict, averageTime, failedCase, error } = action.payload;
        state.submissionId = action.payload.submissionId;
        state.loading = false;
        state.verdict = verdict || "";
        state.failedCase = failedCase || null;
        state.averageTime = averageTime || null;
        state.error = error || null;
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.submissionId = null;
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