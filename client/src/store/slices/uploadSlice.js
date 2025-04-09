import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunk for handling file upload
export const uploadPost = createAsyncThunk(
  'upload/uploadPost',
  async ({ file, caption, mediaType }, { rejectWithValue }) => {
    try {
      console.log("Uploading file:", file.name, "Type:", file.type, "Size:", file.size);
      
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      formData.append('mediaType', mediaType);

      // Log the FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Make sure we're using the correct endpoint
      const response = await api.post('/users/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Upload response:", response.data);
      
      if (!response.data || !response.data.post) {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format from server");
      }
      
      return response.data.post;
    } catch (error) {
      console.error('Upload error:', error);
      return rejectWithValue(error.response?.data?.message || 'Error uploading post');
    }
  }
);

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUploadedPost: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUploadStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.lastUploadedPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadPost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastUploadedPost = action.payload;
      })
      .addCase(uploadPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearUploadStatus } = uploadSlice.actions;

// Selectors
export const selectUploadStatus = (state) => state.upload.status;
export const selectUploadError = (state) => state.upload.error;
export const selectLastUploadedPost = (state) => state.upload.lastUploadedPost;

export default uploadSlice.reducer; 