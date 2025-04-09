import { useState, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { votePost, deletePost } from '../../store/slices/postSlice';
import { selectUser } from '../../store/slices/authSlice';
import { formatDistanceToNow } from 'date-fns';
import { FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';

const PostCard = memo(({ post, showDelete = false }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [error, setError] = useState(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });

  if (!post || typeof post !== 'object') {
    return <div className="bg-gray-800 rounded shadow p-2 mb-2">Invalid post data</div>;
  }

  const {
    _id = 'unknown',
    title = 'Untitled',
    content,
    caption,
    createdAt = new Date().toISOString(),
    media = null,
    mediaType = null,
    upvotedBy = [],
    downvotedBy = [],
    author = post.owner || { _id: 'unknown', username: 'Unknown User', profilePicture: '/default-avatar.png' },
  } = post;

  const postContent = content || caption || 'No content';
  const authorName = author?.username || 'Unknown User';
  const authorId = author?._id || 'unknown';
  const profilePicture = author?.profilePicture || '/default-avatar.png';

  useEffect(() => {
    if (currentUser?._id) {
      setIsUpvoted(upvotedBy.includes(currentUser._id));
      setIsDownvoted(downvotedBy.includes(currentUser._id));
    }
    setVotes({ upvotes: upvotedBy.length, downvotes: downvotedBy.length });
  }, [upvotedBy, downvotedBy, currentUser?._id]);

  const handleVote = async (type) => {
    if (!currentUser) {
      setError('Please login to vote');
      return;
    }

    const prevVotes = { ...votes };
    const prevIsUpvoted = isUpvoted;
    const prevIsDownvoted = isDownvoted;

    try {
      if (type === 'upvote') {
        if (isUpvoted) {
          setVotes((v) => ({ ...v, upvotes: v.upvotes - 1 }));
          setIsUpvoted(false);
        } else {
          setVotes((v) => ({
            upvotes: v.upvotes + 1,
            downvotes: isDownvoted ? v.downvotes - 1 : v.downvotes,
          }));
          setIsUpvoted(true);
          setIsDownvoted(false);
        }
      } else {
        if (isDownvoted) {
          setVotes((v) => ({ ...v, downvotes: v.downvotes - 1 }));
          setIsDownvoted(false);
        } else {
          setVotes((v) => ({
            upvotes: isUpvoted ? v.upvotes - 1 : v.upvotes,
            downvotes: v.downvotes + 1,
          }));
          setIsDownvoted(true);
          setIsUpvoted(false);
        }
      }

      const result = await dispatch(votePost({ postId: _id, type })).unwrap();
      if (result?.upvotedBy && result?.downvotedBy) {
        setVotes({ upvotes: result.upvotedBy.length, downvotes: result.downvotedBy.length });
        setIsUpvoted(result.upvotedBy.includes(currentUser._id));
        setIsDownvoted(result.downvotedBy.includes(currentUser._id));
        setError(null);
      } else throw new Error('Invalid server response');
    } catch (err) {
      setVotes(prevVotes);
      setIsUpvoted(prevIsUpvoted);
      setIsDownvoted(prevIsDownvoted);
      setError(err.message || `Failed to ${type} post`);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(_id)).unwrap();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="bg-gray-800 rounded shadow overflow-hidden h-full flex flex-col">
      {error && <div className="text-red-500 text-xs p-1">{error}</div>}

      <div className="p-2 flex items-center space-x-2 border-b text-white border-gray-700">
        <img src={profilePicture} alt={authorName} className="w-6 h-6 rounded-full" />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <Link to={`/profile/${authorName}`} className="font-medium text-xs hover:text-blue-400">
              {authorName}
            </Link>
            <span className="text-gray-400 text-xs">{formattedDate}</span>
          </div>
        </div>
      </div>

      {media && (
        <div className="relative w-full h-96">
          {mediaType === 'image' && (
            <img src={media} alt="Post media" className="w-full h-full object-contain bg-gray-900" />
          )}
          {mediaType === 'video' && (
            <video src={media} controls className="w-full h-full object-contain bg-gray-900" />
          )}
        </div>
      )}

      <div className="p-2 flex-grow flex flex-col">
        <p className="text-gray-300 text-xs mb-2">{postContent}</p>

        <div className="mt-auto flex items-center space-x-3">
          <button
            onClick={() => handleVote('upvote')}
            className={`flex items-center space-x-1 text-xs ${
              isUpvoted ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
            }`}
            disabled={!currentUser}
          >
            <FaArrowUp />
            <span>{votes.upvotes}</span>
          </button>

          <button
            onClick={() => handleVote('downvote')}
            className={`flex items-center space-x-1 text-xs ${
              isDownvoted ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
            disabled={!currentUser}
          >
            <FaArrowDown />
            <span>{votes.downvotes}</span>
          </button>

          {showDelete && currentUser?._id === authorId && (
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 text-xs">
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default PostCard;
