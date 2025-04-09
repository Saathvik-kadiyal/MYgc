import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  fetchUserProfile,
  fetchCurrentUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  clearProfile
} from '../store/slices/userSlice';
import { deletePost, votePost } from '../store/slices/postSlice';
import Post from '../components/post/PostCard';
import Loader from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();

  const {
    currentUser,
    profile,
    loading,
    error,
    updateSuccess,
  } = useSelector((state) => state.user);
  const { userPosts, postLoading } = useSelector((state) => state.posts);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ bio: '', location: '' });
  const [uploadError, setUploadError] = useState(null);

  const isOwnProfile = !username || (currentUser && username === currentUser.username);

  useEffect(() => {
    if (username) {
      dispatch(fetchUserProfile(username));
    } else if (currentUser) {
      dispatch(fetchCurrentUserProfile());
    }

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, username, currentUser]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  if (!currentUser) return <Navigate to="/login" replace />;
  console.log(profile)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile({ id: profile._id, data: formData })).unwrap();
      setEditMode(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to update profile');
    }
  };


  const handleVote = async (postId, type) => {
    try {
      await dispatch(votePost({ postId, type })).unwrap();
    } catch (err) {
      console.error('Vote failed', err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await dispatch(deletePost(postId)).unwrap();
    } catch (err) {
      console.error('Delete failed', err.message);
    }
  };

  if (loading || postLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {profile ? (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            {isOwnProfile ? (
              <ProfilePictureUpload userId={profile._id} />
            ) : (
              <img
                src={profile.profilePicture || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
          </div>
          <div className="mt-4">
            <h2 className="text-2xl text-white">@{profile.username}</h2>
            {editMode ? (
              <form onSubmit={handleFormSubmit} className="space-y-2 mt-2">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Bio"
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="text-white mt-2">
                <p>{profile.bio}</p>
                <p>{profile.location}</p>
                {isOwnProfile && (
                  <button onClick={() => setEditMode(true)} className="mt-2 bg-blue-600 px-4 py-2 rounded">Edit</button>
                )}
              </div>
            )}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
          </div>
        </div>
      ) : (
        <p className="text-white text-center">Profile not found</p>
      )}

      <div className="mt-8">
        <h3 className="text-xl text-white mb-4">Posts</h3>
        {userPosts?.length ? (
          userPosts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onVote={handleVote}
              onDelete={isOwnProfile ? () => handleDeletePost(post._id) : null}
            />
          ))
        ) : (
          <p className="text-gray-400">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
