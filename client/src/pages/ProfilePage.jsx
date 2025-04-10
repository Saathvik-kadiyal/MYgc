import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { selectUser, updateUserProfile, getUserProfile } from '../store/slices/authSlice';
import { fetchUserProfile } from '../store/slices/userSlice';
import { deletePost } from '../store/slices/postSlice';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PostGrid from '../components/post/PostGrid';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username: urlUsername } = useParams();
  const currentUser = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    phoneNumber: '',
    socialMediaLinks: []
  });
  const [uploadError, setUploadError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        
        if (!urlUsername) {
          // If no username in URL, fetch authenticated user's profile
          response = await dispatch(getUserProfile()).unwrap();
        } else {
          // Fetch the specified user's profile
          response = await dispatch(fetchUserProfile(urlUsername)).unwrap();
        }
        
        setProfileData(response);
      } catch (err) {
        setError(err.message || 'Failed to fetch user data');
        if (err.message === 'User not found') {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, urlUsername, navigate]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        bio: profileData.bio || '',
        location: profileData.location || '',
        phoneNumber: profileData.phoneNumber || '',
        socialMediaLinks: profileData.socialMediaLinks || []
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    setFormData(prev => {
      const newLinks = [...prev.socialMediaLinks];
      if (!newLinks[index]) {
        newLinks[index] = { platform: '', link: '' };
      }
      newLinks[index][field] = value;
      return { ...prev, socialMediaLinks: newLinks };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploadError(null);
      await dispatch(updateUserProfile(formData)).unwrap();
      setEditMode(false);
      // Refresh profile data after update
      const response = await dispatch(getUserProfile()).unwrap();
      setProfileData(response);
    } catch (err) {
      setUploadError(err.message || 'Failed to update profile');
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await dispatch(connectWithUser(profileData._id)).unwrap();
      // Refresh profile data to show updated connection status
      const response = await dispatch(fetchUserProfile(profileData.username)).unwrap();
      setProfileData(response);
    } catch (err) {
      setError(err.message || 'Failed to connect with user');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadError(null);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/users/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh profile data after successful upload
      const updatedProfile = await dispatch(getUserProfile()).unwrap();
      setProfileData(updatedProfile);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload profile picture');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setIsDeleting(true);
      await dispatch(deletePost(postId)).unwrap();
      // Refresh profile data after deletion
      const response = await dispatch(getUserProfile()).unwrap();
      setProfileData(response);
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Alert type="error" message="User not found" />
      </div>
    );
  }

  const isOwnProfile = !urlUsername || (currentUser && currentUser.username === profileData.username);
  const isConnected = profileData.connections?.some(
    conn => conn._id === currentUser?._id
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Card >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt={profileData.username}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl text-white">
                          {profileData.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                  {isOwnProfile && (
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleProfilePictureUpload}
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profileData.username}
                    {profileData.role === 'company' && (
                      <span className="ml-2 text-blue-400 text-sm">(Company)</span>
                    )}
                  </h1>
                </div>
              </div>
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleConnect}
                  disabled={isConnecting || isConnected}
                >
                  {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
                </Button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                {uploadError && (
                  <Alert type="error" message={uploadError} />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Your location"
                  />
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-white font-semibold">Social Media Links</h3>
                  {formData.socialMediaLinks.map((link, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Platform (e.g., Instagram)"
                        value={link.platform}
                        onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                      />
                      <Input
                        placeholder="Link"
                        value={link.link}
                        onChange={(e) => handleSocialMediaChange(index, 'link', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSocialMediaChange(formData.socialMediaLinks.length, 'platform', '')}
                  >
                    Add Social Media Link
                  </Button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                </div>

                {profileData.role === 'company' ? (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Company Type</p>
                        <p className="text-white">{profileData.companyType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Industry</p>
                        <p className="text-white">{profileData.industry || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                ) : profileData.category && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Type</p>
                        <p className="text-white">{profileData.category.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Experience</p>
                        <p className="text-white">{profileData.category.experience} years</p>
                      </div>
                    </div>
                  </div>
                )}

                {profileData.socialMediaLinks && profileData.socialMediaLinks.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.socialMediaLinks.map((link, index) => (
                        <div key={index}>
                          <p className="text-gray-400">{link.platform}</p>
                          <a
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {link.link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="mt-8">
          <h3 className="text-xl text-white mb-4">
            {profileData.role === 'company' ? 'Job Posts' : 'Posts'}
          </h3>
          {profileData.posts?.length ? (
            <PostGrid 
              posts={profileData.posts.map(post => ({
                ...post,
                owner: profileData // Ensure each post has the profile owner's data
              }))}
              onDelete={isOwnProfile ? handleDeletePost : null}
              isDeleting={isDeleting}
              disableVoting={true}
            />
          ) : (
            <p className="text-gray-400">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;