import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { logout } from '../../store/slices/authSlice';
import { fetchCurrentUserProfile } from '../../store/slices/userSlice';

// Memoized selector for current user profile
const selectCurrentUserProfile = (state) => state.user?.currentProfile || null;

const LeftSidebar = () => {
  const location = useLocation();
  const currentProfile = useSelector(selectCurrentUserProfile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch current user profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(fetchCurrentUserProfile()).unwrap();
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };
    
    fetchProfile();
  }, [dispatch]);

  // Memoize navItems to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { path: '/feed', label: 'Feed', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    currentProfile?.role === 'company' ? 
      { path: '/upload-job', label: 'Create Job', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )} : 
      { path: '/upload', label: 'Create Post', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )},
    { path: '/profile', label: 'Profile', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { path: '/notifications', label: 'Notifications', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
  ], []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* User Profile Summary */}
      {currentProfile && (
        <Link to="/profile" className="block mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={currentProfile.profilePicture || '/default-avatar.png'} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <h3 className="text-white font-medium">{currentProfile.username}</h3>
              <p className="text-gray-400 text-sm">{currentProfile.userType || 'User'}</p>
            </div>
          </div>
        </Link>
      )}
      
      {/* Navigation Items */}
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${location.pathname === item.path 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 text-gray-700 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
