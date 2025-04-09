import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10 }, { rejectWithValue, getState }) => {
    try {
      // Check if we already have posts for this page
      const state = getState();
      const existingPosts = state.post.posts;
      const currentPage = state.post.currentPage;
      
      // If we're requesting page 1 and already have posts, return them
      if (page === 1 && existingPosts.length > 0) {
        return {
          posts: existingPosts,
          currentPage: 1,
          hasMore: state.post.hasMore
        };
      }
      
      // If we're requesting a page we already have, return the existing posts
      if (page <= currentPage && existingPosts.length > 0) {
        return {
          posts: existingPosts,
          currentPage: currentPage,
          hasMore: state.post.hasMore
        };
      }
      
      console.log('Fetching posts from API:', `/posts/feed?page=${page}&limit=${limit}`);
      const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Invalid response format: response.data is undefined', response);
        throw new Error('Invalid response format: response.data is undefined');
      }
      
      // Check if posts array exists in the response
      if (!response.data.posts) {
        console.error('Invalid response format: posts array is missing', response.data);
        // Return an empty posts array instead of throwing an error
        return {
          posts: [],
          currentPage: page,
          hasMore: false,
          totalPosts: 0
        };
      }
      
      // Transform the posts to match the expected structure
      const posts = response.data.posts.map(post => ({
        ...post,
        author: post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
        upvotes: post.upvotedBy || [],
        downvotes: post.downvotedBy || [],
        media: post.media || null,
        mediaType: post.mediaType || null,
        caption: post.caption || post.content || 'No content'
      }));
      
      return { 
        ...response.data, 
        posts,
        // Ensure these properties exist with default values
        currentPage: response.data.currentPage || page,
        hasMore: response.data.hasMore !== undefined ? response.data.hasMore : false,
        totalPosts: response.data.totalPosts || 0
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.status, error.response.data);
        
        if (error.response.status === 401) {
          return rejectWithValue('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          return rejectWithValue('You do not have permission to access this resource.');
        } else if (error.response.status === 404) {
          return rejectWithValue('The requested resource was not found.');
        } else {
          return rejectWithValue(error.response.data.message || 'Failed to fetch posts');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return rejectWithValue('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        return rejectWithValue('Failed to set up request: ' + error.message);
      }
    }
  }
);

// Async thunk for voting on a post
export const votePost = createAsyncThunk(
  'posts/votePost',
  async ({ postId, type }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/vote`, { type });
      // Transform the response to match the expected structure
      return {
        postId,
        upvotedBy: response.data.upvotedBy || [],
        downvotedBy: response.data.downvotedBy || []
      };
      console.log("triggered")
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on post');
    }
  }
);

// Async thunk for deleting a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

const initialState = {
  posts: [],
  postCache: {},
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.postCache = {};
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
    addPostToCache: (state, action) => {
      state.postCache[action.payload._id] = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        
        // Filter out any posts that already exist in the state
        const newPosts = action.payload.posts.filter(newPost => 
          !state.posts.some(existingPost => existingPost._id === newPost._id)
        );
        
        state.posts = [...state.posts, ...newPosts];
        state.currentPage = action.payload.currentPage;
        state.hasMore = action.payload.hasMore;
        
        // Update post cache only for new posts
        newPosts.forEach(post => {
          state.postCache[post._id] = post;
        });
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Vote post
      .addCase(votePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(votePost.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, upvotedBy, downvotedBy } = action.payload;
        
        // Update post in posts array
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].upvotedBy = upvotedBy;
          state.posts[postIndex].downvotedBy = downvotedBy;
        }
        
        // Update post in cache
        if (state.postCache[postId]) {
          state.postCache[postId].upvotedBy = upvotedBy;
          state.postCache[postId].downvotedBy = downvotedBy;
        }
      })
      .addCase(votePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post._id !== action.payload);
        delete state.postCache[action.payload];
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPosts, addPostToCache, clearError } = postSlice.actions;

// Selectors
export const selectPosts = (state) => state.post.posts;
export const selectPostsLoading = (state) => state.post.loading;
export const selectPostsError = (state) => state.post.error;
export const selectCurrentPage = (state) => state.post.currentPage;
export const selectHasMore = (state) => state.post.hasMore;
export const selectPostById = (state, postId) => state.post.postCache[postId];

export default postSlice.reducer; 