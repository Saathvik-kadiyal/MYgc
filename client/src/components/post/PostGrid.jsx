import { useRef, useCallback } from 'react';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

const PostGrid = ({ posts, loading, error, onLoadMore, hasMore }) => {
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
          className="h-full"
        >
          <PostCard post={post} />
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