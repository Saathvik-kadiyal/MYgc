import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, selectPosts, selectPostsLoading, selectPostsError } from '../../store/slices/postSlice';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';

const PostList = memo(({ posts, loading, hasMore, lastPostElementRef }) => {
  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];
  
  return (
    <div className="flex flex-col space-y-4">
      {safePosts.length > 0 ? (
        safePosts.map((post, index) => {
          // Ensure post is a valid object
          if (!post || typeof post !== 'object') {
            console.error('Invalid post object:', post);
            return null;
          }
          
          if (safePosts.length === index + 1 && hasMore) {
            return (
              <div key={post._id || `post-${index}`} ref={lastPostElementRef}>
                <PostCard post={post} showDelete={false} />
              </div>
            );
          } else {
            return <PostCard key={post._id || `post-${index}`} post={post} showDelete={false} />;
          }
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No posts yet. Be the first to post!</p>
        </div>
      )}
      
      {loading && safePosts.length === 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {loading && safePosts.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
});

PostList.displayName = 'PostList';

export default PostList; 