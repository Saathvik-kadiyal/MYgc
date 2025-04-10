import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Thunks
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/profile');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Authentication failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return {
        ...res.data,
        isCompany: res.data.isCompany || false
      };
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

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const initiateCompanySignup = createAsyncThunk(
  'auth/initiateCompanySignup', 
  async (companyData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/company/signup/initiate', companyData);
      return {
        ...res.data,
        companyData,
        email: companyData.email
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Company signup failed');
    }
  }
);

export const verifyCompanySignup = createAsyncThunk(
  'auth/verifyCompanySignup',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/company/signup/verify', { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Company verification failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isCompany: false,
    loading: false,
    error: null,
    signupEmail: null,
    signupData: null,
    otpSent: false
  },
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
      state.isCompany = false;
      state.error = null;
      state.signupEmail = null;
      state.signupData = null;
      state.otpSent = false;
      localStorage.removeItem('authToken');
    }
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
        state.isCompany = action.payload?.role === 'company';
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isCompany = action.payload.isCompany;
        state.error = null;
        if (action.payload.token) {
          localStorage.setItem('authToken', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Initiate Signup
      .addCase(initiateSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.signupEmail = action.payload.email;
        state.signupData = action.payload.signupData;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(initiateSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Signup
      .addCase(verifySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isCompany = false;
        state.error = null;
        if (action.payload.token) {
          localStorage.setItem('authToken', action.payload.token);
        }
      })
      .addCase(verifySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isCompany = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Initiate Company Signup
      .addCase(initiateCompanySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateCompanySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.signupEmail = action.payload.email;
        state.signupData = action.payload.companyData;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(initiateCompanySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Company Signup
      .addCase(verifyCompanySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCompanySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isCompany = true;
        state.error = null;
        if (action.payload.token) {
          localStorage.setItem('authToken', action.payload.token);
        }
      })
      .addCase(verifyCompanySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Company verification failed';
        console.error('Company verification failed:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta
        });
      });
  }
});

// Export actions and selectors
export const { clearError, resetSignupState, clearAuthState } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsCompany = (state) => state.auth.isCompany;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectSignupEmail = (state) => state.auth.signupEmail;
export const selectSignupData = (state) => state.auth.signupData;
export const selectOtpSent = (state) => state.auth.otpSent;

export default authSlice.reducer;
