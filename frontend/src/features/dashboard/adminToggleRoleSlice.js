import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const toggleUserRole = createAsyncThunk(
  "admin/toggleUserRole",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/api/users/toggle/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle user role"
      );
    }
  }
);

const adminToggleRoleSlice = createSlice({
  name: "adminToggleRole",
  initialState: {
    loading: false,
    error: null,
    success: false,
    updatedRole: null,
  },
  reducers: {
    resetToggleRoleState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.updatedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.updatedRole = null;
      })
      .addCase(toggleUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedRole = action.payload.role;
      })
      .addCase(toggleUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetToggleRoleState } = adminToggleRoleSlice.actions;
export default adminToggleRoleSlice.reducer;
