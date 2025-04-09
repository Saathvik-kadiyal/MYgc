import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunk for searching users
export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async ({ category, query }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/search/${category}?query=${query}`);
      return {
        category,
        results: response.data.users || response.data.brands || [],
        query
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

const initialState = {
  results: {},  // Keyed by category and query
  recentSearches: [], // Store recent search queries
  loading: false,
  error: null,
  currentCategory: null,
  currentQuery: ''
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = {};
      state.error = null;
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    addRecentSearch: (state, action) => {
      const { category, query } = action.payload;
      // Keep only unique recent searches, limited to 10
      state.recentSearches = [
        { category, query },
        ...state.recentSearches.filter(
          search => !(search.category === category && search.query === query)
        )
      ].slice(0, 10);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        const { category, query, results } = action.payload;
        state.loading = false;
        // Cache results by category and query
        state.results[`${category}-${query}`] = results;
        state.currentQuery = query;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectSearchResults = (state, category, query) => 
  state.search.results[`${category}-${query}`] || [];
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;
export const selectRecentSearches = (state) => state.search.recentSearches;
export const selectCurrentCategory = (state) => state.search.currentCategory;
export const selectCurrentQuery = (state) => state.search.currentQuery;

export const { 
  clearResults, 
  clearRecentSearches, 
  setCurrentCategory,
  addRecentSearch 
} = searchSlice.actions;

export default searchSlice.reducer; 