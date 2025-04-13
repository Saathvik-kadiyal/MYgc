import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const createPost = createAsyncThunk(
    'post/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await api.post('/posts', postData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPosts = createAsyncThunk(
    'post/fetchPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/posts');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'post/fetchPostById',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updatePost = createAsyncThunk(
    'post/updatePost',
    async ({ postId, postData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/posts/${postId}`, postData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deletePost = createAsyncThunk(
    'post/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            await api.delete(`/posts/${postId}`);
            return postId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const likePost = createAsyncThunk(
    'post/likePost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unlikePost = createAsyncThunk(
    'post/unlikePost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/unlike`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const addComment = createAsyncThunk(
    'post/addComment',
    async ({ postId, commentData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/posts/${postId}/comment`, commentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteComment = createAsyncThunk(
    'post/deleteComment',
    async ({ postId, commentId }, { rejectWithValue }) => {
        try {
            await api.delete(`/posts/${postId}/comment/${commentId}`);
            return { postId, commentId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    posts: [],
    currentPost: null,
    loading: false,
    error: null
};

const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts.unshift(action.payload);
                state.error = null;
                toast.success('Post created successfully');
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create post';
                toast.error(state.error);
            })

            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch posts';
                toast.error(state.error);
            })

            // Fetch Post by ID
            .addCase(fetchPostById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPost = action.payload;
                state.error = null;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch post';
                toast.error(state.error);
            })

            // Update Post
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
                if (state.currentPost?._id === action.payload._id) {
                    state.currentPost = action.payload;
                }
                state.error = null;
                toast.success('Post updated successfully');
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update post';
                toast.error(state.error);
            })

            // Delete Post
            .addCase(deletePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.filter(post => post._id !== action.payload);
                if (state.currentPost?._id === action.payload) {
                    state.currentPost = null;
                }
                state.error = null;
                toast.success('Post deleted successfully');
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete post';
                toast.error(state.error);
            })

            // Like Post
            .addCase(likePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
                if (state.currentPost?._id === action.payload._id) {
                    state.currentPost = action.payload;
                }
                state.error = null;
            })
            .addCase(likePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to like post';
                toast.error(state.error);
            })

            // Unlike Post
            .addCase(unlikePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
                if (state.currentPost?._id === action.payload._id) {
                    state.currentPost = action.payload;
                }
                state.error = null;
            })
            .addCase(unlikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to unlike post';
                toast.error(state.error);
            })

            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
                if (state.currentPost?._id === action.payload._id) {
                    state.currentPost = action.payload;
                }
                state.error = null;
                toast.success('Comment added successfully');
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to add comment';
                toast.error(state.error);
            })

            // Delete Comment
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.map(post => 
                    post._id === action.payload.postId 
                        ? { ...post, comments: post.comments.filter(c => c._id !== action.payload.commentId) }
                        : post
                );
                if (state.currentPost?._id === action.payload.postId) {
                    state.currentPost = {
                        ...state.currentPost,
                        comments: state.currentPost.comments.filter(c => c._id !== action.payload.commentId)
                    };
                }
                state.error = null;
                toast.success('Comment deleted successfully');
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete comment';
                toast.error(state.error);
            });
    }
});

// Selectors
export const selectPosts = (state) => state.post.posts;
export const selectCurrentPost = (state) => state.post.currentPost;
export const selectPostLoading = (state) => state.post.loading;
export const selectPostError = (state) => state.post.error;

export const { clearCurrentPost, clearError } = postSlice.actions;
export default postSlice.reducer; 