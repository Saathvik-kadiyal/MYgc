import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchCurrentUserProfile = createAsyncThunk(
    'user/fetchCurrentUserProfile',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { user, company, role } = state.auth;
            
            // Get the current user's username based on role
            const username = role === 'company' ? company?.username : user?.username;
            
            if (!username) {
                throw new Error('Not authenticated');
            }
            
            // Use different endpoints based on role
            const endpoint = role === 'company' ? `/companies/${username}` : `/users/${username}`;
            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async ({ username, isCompany }, { rejectWithValue }) => {
        try {
            const endpoint = isCompany ? `/companies/${username}` : `/users/${username}`;
            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async ({ username, data, isCompany }, { rejectWithValue }) => {
        try {
            const endpoint = isCompany ? `/companies/${username}` : `/users/${username}`;
            const response = await api.put(endpoint, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const uploadProfilePicture = createAsyncThunk(
    'user/uploadProfilePicture',
    async ({ formData, isCompany }, { rejectWithValue }) => {
        try {
            const endpoint = isCompany ? '/companies/profile/upload' : '/users/profile/upload';
            const response = await api.post(endpoint, formData, {
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

export const followUser = createAsyncThunk(
    'user/followUser',
    async ({ username, isCompany }, { rejectWithValue }) => {
        try {
            const endpoint = isCompany ? `/companies/${username}/follow` : `/users/${username}/follow`;
            const response = await api.post(endpoint);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unfollowUser = createAsyncThunk(
    'user/unfollowUser',
    async ({ username, isCompany }, { rejectWithValue }) => {
        try {
            const endpoint = isCompany ? `/companies/${username}/unfollow` : `/users/${username}/unfollow`;
            const response = await api.post(endpoint);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    currentProfile: null,
    profile: null,
    followers: [],
    following: [],
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        },
        clearCurrentProfile: (state) => {
            state.currentProfile = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Current User Profile
            .addCase(fetchCurrentUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProfile = action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch profile';
                toast.error(state.error);
            })

            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch user profile';
                toast.error(state.error);
            })

            // Update User Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
                toast.success('Profile updated successfully');
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update profile';
                toast.error(state.error);
            })

            // Upload Profile Picture
            .addCase(uploadProfilePicture.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentProfile) {
                    state.currentProfile.profilePicture = action.payload.profilePicture;
                }
                state.error = null;
                toast.success('Profile picture uploaded successfully');
            })
            .addCase(uploadProfilePicture.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to upload profile picture';
                toast.error(state.error);
            })

            // Follow User
            .addCase(followUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.loading = false;
                if (state.profile) {
                    state.profile.followers = action.payload.followers;
                }
                state.error = null;
                toast.success('User followed successfully');
            })
            .addCase(followUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to follow user';
                toast.error(state.error);
            })

            // Unfollow User
            .addCase(unfollowUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.loading = false;
                if (state.profile) {
                    state.profile.followers = action.payload.followers;
                }
                state.error = null;
                toast.success('User unfollowed successfully');
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to unfollow user';
                toast.error(state.error);
            });
    }
});

// Selectors
export const selectCurrentProfile = (state) => state.user.currentProfile;
export const selectProfile = (state) => state.user.profile;
export const selectFollowers = (state) => state.user.followers;
export const selectFollowing = (state) => state.user.following;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

export const { clearProfile, clearCurrentProfile, clearError } = userSlice.actions;
export default userSlice.reducer; 