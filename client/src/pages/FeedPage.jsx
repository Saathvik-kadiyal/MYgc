import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, selectPosts, selectPostsLoading, selectPostsError, selectHasMore, selectCurrentPage, clearPosts } from '../store/slices/postSlice';
import PostList from '../components/post/PostList.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Alert from '../components/common/Alert.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const FeedPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const posts = useSelector(selectPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);
  const hasMore = useSelector(selectHasMore);
  const currentPage = useSelector(selectCurrentPage);
  
  // Use a ref to track if posts have been fetched
  const hasFetchedPosts = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const maxFetchAttempts = 3;
  
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    // Disconnect previous observer if it exists
    if (observer.current) {
      observer.current.disconnect();
    }
    
    // If no node is provided or loading, don't set up a new observer
    if (!node || loading) return;
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchPosts({ page: currentPage + 1 }));
      }
    });
    
    // Observe the node
    observer.current.observe(node);
  }, [loading, hasMore, currentPage, dispatch]);

  useEffect(() => {
    // Only fetch posts if we're on the feed page and haven't fetched posts yet
    if (!hasFetchedPosts.current && location.pathname === '/feed') {
      // Clear posts when component mounts to avoid duplicates
      dispatch(clearPosts());
      // Initial load
      dispatch(fetchPosts({ page: 1 }));
      hasFetchedPosts.current = true;
      setFetchAttempts(prev => prev + 1);
    }

    // Cleanup observer when component unmounts
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [dispatch, location.pathname]);

  // Reset the hasFetchedPosts ref when the pathname changes
  useEffect(() => {
    if (location.pathname !== '/feed') {
      hasFetchedPosts.current = false;
    }
  }, [location.pathname]);

  // Handle authentication errors
  useEffect(() => {
    if (error && error.includes('Authentication required')) {
      // Redirect to login page
      navigate('/login', { state: { from: '/feed' } });
    }
  }, [error, navigate]);

  // Handle fetch errors and retry logic
  useEffect(() => {
    if (error && fetchAttempts < maxFetchAttempts) {
      console.log(`Retrying fetch (attempt ${fetchAttempts + 1}/${maxFetchAttempts})...`);
      const timer = setTimeout(() => {
        hasFetchedPosts.current = false;
        dispatch(clearPosts());
        dispatch(fetchPosts({ page: 1 }));
        setFetchAttempts(prev => prev + 1);
      }, 2000); // Wait 2 seconds before retrying
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchAttempts, dispatch, maxFetchAttempts]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    hasFetchedPosts.current = false;
    setFetchAttempts(0);
    dispatch(clearPosts());
    dispatch(fetchPosts({ page: 1 }));
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert type="error" message={error} />
        <div className="mt-4 flex justify-center">
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {posts.length === 0 && !loading ? (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
          <p className="text-gray-600 mb-4">Be the first to create a post!</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : (
        <PostList 
          posts={posts} 
          loading={loading} 
          hasMore={hasMore}
          lastPostElementRef={lastPostElementRef}
        />
      )}
      
      {loading && posts.length === 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default FeedPage;