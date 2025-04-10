import { useRef, useCallback, useState } from 'react';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

const PostGrid = ({ posts, loading, error, onLoadMore, hasMore, onDelete, isDeleting, disableVoting }) => {
  const [showDelete, setShowDelete] = useState(null);
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && onLoadMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  if (loading && !posts?.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading posts: {error}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No posts found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {posts.map((post, index) => (
        <div
          key={post._id || index}
          ref={index === posts.length - 1 && hasMore ? lastPostElementRef : null}
          className="h-full relative group"
        >
          <PostCard
            post={post}
            disableVoting={disableVoting}
            author={post.author || profileData} // Pass either post author or profile owner
          />
          {onDelete && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setShowDelete(post._id)}
                className="text-gray-300 hover:text-white bg-black bg-opacity-50 rounded-full p-1"
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showDelete === post._id && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      setShowDelete(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                    disabled={isDeleting}
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div className="col-span-full flex justify-center py-2">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default PostGrid; 