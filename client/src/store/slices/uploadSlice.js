import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const uploadMedia = createAsyncThunk(
    'upload/uploadMedia',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/upload/media', formData, {
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

export const uploadProfilePicture = createAsyncThunk(
    'upload/uploadProfilePicture',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/upload/profile-picture', formData, {
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

const initialState = {
    uploadedMedia: null,
    uploadedProfilePicture: null,
    loading: false,
    error: null
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        clearUploadedMedia: (state) => {
            state.uploadedMedia = null;
        },
        clearUploadedProfilePicture: (state) => {
            state.uploadedProfilePicture = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Upload Media
            .addCase(uploadMedia.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.uploadedMedia = action.payload;
                state.error = null;
                toast.success('Media uploaded successfully');
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to upload media';
                toast.error(state.error);
            })

            // Upload Profile Picture
            .addCase(uploadProfilePicture.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action) => {
                state.loading = false;
                state.uploadedProfilePicture = action.payload;
                state.error = null;
                toast.success('Profile picture uploaded successfully');
            })
            .addCase(uploadProfilePicture.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to upload profile picture';
                toast.error(state.error);
            });
    }
});

// Selectors
export const selectUploadedMedia = (state) => state.upload.uploadedMedia;
export const selectUploadedProfilePicture = (state) => state.upload.uploadedProfilePicture;
export const selectUploadLoading = (state) => state.upload.loading;
export const selectUploadError = (state) => state.upload.error;

export const { clearUploadedMedia, clearUploadedProfilePicture, clearError } = uploadSlice.actions;
export default uploadSlice.reducer; 