import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/check-auth');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const initiateSignup = createAsyncThunk(
    'auth/initiateSignup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup/initiate', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verifySignup = createAsyncThunk(
    'auth/verifySignup',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup/verify', { email, otp });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/logout');
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    user: null,
    role: null,
    token: null,
    loading: false,
    error: null,
    signupStep: 'initiate', // 'initiate' or 'verify'
    tempUserData: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setRole: (state, action) => {
            state.role = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setTempUserData: (state, action) => {
            state.tempUserData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Check Auth Status
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || action.payload.company;
                state.token = action.payload.token;
                state.role = action.payload.user?.role || action.payload.company?.role;
                toast.success('Authentication status checked successfully');
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to check authentication status';
                toast.error(state.error);
            })

            // Initiate Signup
            .addCase(initiateSignup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initiateSignup.fulfilled, (state, action) => {
                state.loading = false;
                state.signupStep = 'verify';
                state.tempUserData = action.payload;
                toast.success('Verification code sent to your email');
            })
            .addCase(initiateSignup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to initiate signup';
                toast.error(state.error);
            })

            // Verify Signup
            .addCase(verifySignup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifySignup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || action.payload.company;
                state.token = action.payload.token;
                state.signupStep = 'initiate';
                state.tempUserData = null;
                toast.success('Account created successfully');
            })
            .addCase(verifySignup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to verify signup';
                toast.error(state.error);
            })

            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || action.payload.company;
                state.token = action.payload.token;
                state.role = action.payload.user?.role || action.payload.company?.role;
                toast.success('Logged in successfully');
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to login';
                toast.error(state.error);
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.role = null;
                toast.success('Logged out successfully');
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to logout';
                toast.error(state.error);
            });
    }
});

export const { setRole, clearError, setTempUserData } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectCompany = (state) => state.auth.company;
export const selectToken = (state) => state.auth.token;
export const selectRole = (state) => state.auth.role;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectSignupStep = (state) => state.auth.signupStep;
export const selectTempUserData = (state) => state.auth.tempUserData;
