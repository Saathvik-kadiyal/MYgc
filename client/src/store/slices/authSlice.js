// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// -------------------- Thunks --------------------

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching auth profile...');
      const res = await api.get('/auth/profile');
      console.log('Auth profile response:', res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Authentication failed');
    }
  }
);

export const manualLogin = createAsyncThunk(
  'auth/manualLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const initiateSignup = createAsyncThunk(
  'auth/initiateSignup',
  async (signupData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/signup/initiate', signupData);
      return {
        ...res.data,
        signupData,
        email: signupData.email,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Signup initiation failed');
    }
  }
);

export const verifySignup = createAsyncThunk(
  'auth/verifySignup',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/signup/verify', { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Signup verification failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

// -------------------- Initial State --------------------

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  signupEmail: null,
  signupData: null,
  otpSent: false,
};

// -------------------- Slice --------------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSignupState: (state) => {
      state.signupEmail = null;
      state.signupData = null;
      state.otpSent = false;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.signupEmail = null;
      state.signupData = null;
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Manual login
      .addCase(manualLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(manualLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(manualLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Signup initiation
      .addCase(initiateSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.signupEmail = action.payload.email;
        state.signupData = action.payload.signupData;
        state.otpSent = true;
      })
      .addCase(initiateSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.signupEmail = null;
        state.signupData = null;
        state.otpSent = false;
      })
      .addCase(verifySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.signupEmail = null;
        state.signupData = null;
        state.otpSent = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// -------------------- Exports --------------------

export const {
  clearError,
  resetSignupState,
  clearAuthState,
} = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectSignupEmail = (state) => state.auth.signupEmail;
export const selectSignupData = (state) => state.auth.signupData;
export const selectOtpSent = (state) => state.auth.otpSent;

export default authSlice.reducer;
