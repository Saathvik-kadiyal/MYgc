import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const searchAllUsers = createAsyncThunk(
    'search/searchAllUsers',
    async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/search/users/all', { 
                params: { query, page, limit } 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchFreshers = createAsyncThunk(
    'search/searchFreshers',
    async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/search/users/freshers', { 
                params: { query, page, limit } 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchExperienced = createAsyncThunk(
    'search/searchExperienced',
    async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/search/users/experienced', { 
                params: { query, page, limit } 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchBrands = createAsyncThunk(
    'search/searchBrands',
    async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/search/companies', { 
                params: { query, page, limit } 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    allUsers: [],
    freshers: [],
    experienced: [],
    brands: [],
    currentCategory: 'allUsers',
    currentPage: 1,
    hasMore: true,
    loading: false,
    error: null
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },
        clearResults: (state) => {
            state.allUsers = [];
            state.freshers = [];
            state.experienced = [];
            state.brands = [];
            state.currentPage = 1;
            state.hasMore = true;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Search All Users
            .addCase(searchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.allUsers = [...state.allUsers, ...action.payload.users];
                state.currentPage = action.payload.currentPage;
                state.hasMore = action.payload.hasMore;
                state.error = null;
            })
            .addCase(searchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to search users';
                toast.error(state.error);
            })

            // Search Freshers
            .addCase(searchFreshers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchFreshers.fulfilled, (state, action) => {
                state.loading = false;
                state.freshers = [...state.freshers, ...action.payload.users];
                state.currentPage = action.payload.currentPage;
                state.hasMore = action.payload.hasMore;
                state.error = null;
            })
            .addCase(searchFreshers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to search freshers';
                toast.error(state.error);
            })

            // Search Experienced
            .addCase(searchExperienced.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchExperienced.fulfilled, (state, action) => {
                state.loading = false;
                state.experienced = [...state.experienced, ...action.payload.users];
                state.currentPage = action.payload.currentPage;
                state.hasMore = action.payload.hasMore;
                state.error = null;
            })
            .addCase(searchExperienced.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to search experienced users';
                toast.error(state.error);
            })

            // Search Brands
            .addCase(searchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = [...state.brands, ...action.payload.companies];
                state.currentPage = action.payload.currentPage;
                state.hasMore = action.payload.hasMore;
                state.error = null;
            })
            .addCase(searchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to search brands';
                toast.error(state.error);
            });
    }
});

// Selectors
export const selectAllUsers = (state) => state.search.allUsers;
export const selectFreshers = (state) => state.search.freshers;
export const selectExperienced = (state) => state.search.experienced;
export const selectBrands = (state) => state.search.brands;
export const selectCurrentCategory = (state) => state.search.currentCategory;
export const selectCurrentPage = (state) => state.search.currentPage;
export const selectHasMore = (state) => state.search.hasMore;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;

export const { setCurrentCategory, clearResults, clearError } = searchSlice.actions;
export default searchSlice.reducer; 