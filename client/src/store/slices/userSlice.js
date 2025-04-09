import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchCurrentUserProfile = createAsyncThunk(
  'user/fetchCurrentUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the current user's profile
      const state = getState();
      if (state.user.currentProfile) {
        console.log('Using cached current user profile');
        return state.user.currentProfile;
      }
      
      // Get current user's username from auth state
      const authState = getState();
      const username = authState.auth.user?.username;
      if (!username) {
        throw new Error('Not authenticated');
      }
      const response = await api.get(`/users/${username}`);
      console.log(`Current user profile raw response: ${response}`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data) {
        console.error('API returned empty data');
        throw new Error('Invalid response format');
      }
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
      
      console.log('Current user profile response:', response.data);
      
      // Transform the response data to match the expected structure
      const profile = {
        ...response.data,
        posts: response.data.posts?.map(post => ({
          ...post,
          // Ensure the post has the same structure as feed posts
          _id: post._id || 'unknown',
          title: post.title || 'Untitled',
          content: post.content || post.caption || 'No content',
          createdAt: post.createdAt || new Date().toISOString(),
          owner: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
          author: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
          upvotedBy: Array.isArray(post.upvotedBy) ? post.upvotedBy : [],
          downvotedBy: Array.isArray(post.downvotedBy) ? post.downvotedBy : [],
          upvotes: post.upvotedBy?.length || 0,
          downvotes: post.downvotedBy?.length || 0,
          media: post.media || null,
          mediaType: post.mediaType || null,
          caption: post.caption || post.content || 'No content'
        })) || []
      };
      
      return profile;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (username, { rejectWithValue, getState }) => {
    try {
      if (!username) {
        throw new Error('Username is required');
      }
      
      // Check if we already have this user's profile
      const state = getState();
      if (state.user.profile && state.user.profile.username === username) {
        console.log('Using cached user profile for:', username);
        return state.user.profile;
      }
      
      console.log('Fetching user profile for username:', username);
      const response = await api.get(`/users/${username}`);
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
      
      console.log('User profile response:', response.data);
      
      // Transform the response data to match the expected structure
      const profile = {
        ...response.data,
        posts: response.data.posts?.map(post => ({
          ...post,
          // Ensure the post has the same structure as feed posts
          _id: post._id || 'unknown',
          title: post.title || 'Untitled',
          content: post.content || post.caption || 'No content',
          createdAt: post.createdAt || new Date().toISOString(),
          owner: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
          author: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
          upvotedBy: Array.isArray(post.upvotedBy) ? post.upvotedBy : [],
          downvotedBy: Array.isArray(post.downvotedBy) ? post.downvotedBy : [],
          upvotes: post.upvotedBy?.length || 0,
          downvotes: post.downvotedBy?.length || 0,
          media: post.media || null,
          mediaType: post.mediaType || null,
          caption: post.caption || post.content || 'No content'
        })) || []
      };
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      const response = await api.put(`/users/${id}`, data);
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
      
      // Transform the response data to match the expected structure
      const profile = {
        ...response.data,
        posts: response.data.posts?.map(post => ({
          ...post,
          author: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
          upvotes: post.upvotedBy || [],
          downvotes: post.downvotedBy || []
        })) || []
      };
      
      return profile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (formData, { rejectWithValue }) => {
    try {
      if (!formData || !(formData instanceof FormData)) {
        throw new Error('Invalid form data');
      }
      
      console.log('Sending profile picture upload request to:', '/users/profile/upload');
      
      const response = await api.post('/users/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Verify the response structure matches backend
      if (!response.data || !response.data.user || !response.data.user.profilePicture) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Profile picture upload response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.user) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
      
      // Log the user data to verify the profile picture URL
      console.log('User data from response:', {
        id: response.data.user._id,
        username: response.data.user.username,
        profilePicture: response.data.user.profilePicture
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }
);

// Initial state
const initialState = {
  currentProfile: null, // Current user's profile (for sidebar)
  profile: null,        // Profile being viewed (for profile page)
  loading: false,
  error: null,
  uploadError: null,
  isUploading: false,
};

// Create the slice
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
    setUploadError: (state, action) => {
      state.uploadError = action.payload;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user profile
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      })
      
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
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
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        // Update the profile picture in the state
        if (state.profile && action.payload.user) {
          state.profile.profilePicture = action.payload.user.profilePicture;
          console.log('Updated profile picture in state:', state.profile.profilePicture);
        }
        state.error = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearProfile, 
  clearCurrentProfile,
  setUploadError, 
  clearUploadError, 
  setIsUploading 
} = userSlice.actions;

// Export selectors
export const selectCurrentProfile = (state) => state.user.currentProfile;
export const selectProfile = (state) => state.user.profile;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;
export const selectUploadError = (state) => state.user.uploadError;
export const selectIsUploading = (state) => state.user.isUploading;

// Export reducer
export default userSlice.reducer; 