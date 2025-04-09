import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { selectUser } from '../store/slices/authSlice';

const SearchPage = () => {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector(selectUser);

  const categoryTitles = {
    freshers: 'Freshers',
    brands: 'Brands',
    experienced: 'Experienced Users'
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Making API call to: /search/${category}?query=${searchQuery}`);
      const response = await api.get(`/search/${category}?query=${searchQuery}`);
      console.log('Search response:', response.data);
      setSearchResults(response.data.users || response.data.brands || []);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.response?.data?.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Search {categoryTitles[category]}
      </h1>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${categoryTitles[category]}...`}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="bg-gray-800 rounded-lg p-6 flex items-center space-x-4"
            >
              {/* User Avatar */}
              <img
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />

              {/* User Info */}
              <div className="flex-1">
                <Link
                  to={`/profile/${user.username}`}
                  className="text-lg font-semibold text-white hover:text-blue-500"
                >
                  {user.username}
                </Link>
                <p className="text-gray-400">{user.phoneNumber}</p>
                {user.category && (
                  <span className="inline-block bg-blue-500 text-white text-sm px-2 py-1 rounded mt-2">
                    {user.category.type}
                    {user.category.experience && ` • ${user.category.experience}+ years`}
                  </span>
                )}
              </div>

              {/* Connect Button (if not current user) */}
              {currentUser._id !== user._id && (
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && searchQuery && searchResults.length === 0 && (
        <p className="text-center text-gray-400">No results found</p>
      )}
    </div>
  );
};

export default SearchPage; 