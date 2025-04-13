import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchCompanyProfile = createAsyncThunk(
    'company/fetchCompanyProfile',
    async (username, { rejectWithValue }) => {
        try {
            const response = await api.get(`/companies/${username}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCompanyProfile = createAsyncThunk(
    'company/updateCompanyProfile',
    async ({ username, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/companies/${username}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const uploadCompanyProfilePicture = createAsyncThunk(
    'company/uploadCompanyProfilePicture',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/companies/profile/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const followCompany = createAsyncThunk(
    'company/followCompany',
    async (username, { rejectWithValue }) => {
        try {
            const response = await api.post(`/companies/${username}/follow`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unfollowCompany = createAsyncThunk(
    'company/unfollowCompany',
    async (username, { rejectWithValue }) => {
        try {
            const response = await api.post(`/companies/${username}/unfollow`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    profile: null,
    loading: false,
    error: null
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.profile = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Company Profile
            .addCase(fetchCompanyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchCompanyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch company profile';
                toast.error(state.error);
            })

            // Update Company Profile
            .addCase(updateCompanyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCompanyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
                toast.success('Profile updated successfully');
            })
            .addCase(updateCompanyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update profile';
                toast.error(state.error);
            })

            // Upload Company Profile Picture
            .addCase(uploadCompanyProfilePicture.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadCompanyProfilePicture.fulfilled, (state, action) => {
                state.loading = false;
                if (state.profile) {
                    state.profile.profilePicture = action.payload.profilePicture;
                }
                state.error = null;
                toast.success('Profile picture uploaded successfully');
            })
            .addCase(uploadCompanyProfilePicture.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to upload profile picture';
                toast.error(state.error);
            })

            // Follow Company
            .addCase(followCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(followCompany.fulfilled, (state, action) => {
                state.loading = false;
                if (state.profile) {
                    state.profile.followers = action.payload.followers;
                }
                state.error = null;
                toast.success('Company followed successfully');
            })
            .addCase(followCompany.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to follow company';
                toast.error(state.error);
            })

            // Unfollow Company
            .addCase(unfollowCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unfollowCompany.fulfilled, (state, action) => {
                state.loading = false;
                if (state.profile) {
                    state.profile.followers = action.payload.followers;
                }
                state.error = null;
                toast.success('Company unfollowed successfully');
            })
            .addCase(unfollowCompany.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to unfollow company';
                toast.error(state.error);
            });
    }
});

// Selectors
export const selectCompanyProfile = (state) => state.company.profile;
export const selectCompanyLoading = (state) => state.company.loading;
export const selectCompanyError = (state) => state.company.error;

export const { clearProfile, clearError } = companySlice.actions;
export default companySlice.reducer; 