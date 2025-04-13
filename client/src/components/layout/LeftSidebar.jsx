import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const LeftSidebar = ({ isCompany, user, company }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileUsername = isCompany ? company?.username : user?.username;

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/" className="text-2xl font-bold text-white">
          MYgc
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <Link
          to="/feed"
          className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
        >
          <span>Feed</span>
        </Link>

        <Link
          to={`/profile/${profileUsername}`}
          className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
        >
          <span>Profile</span>
        </Link>

        {!isCompany && (
          <>
            <Link
              to="/jobs"
              className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              <span>Jobs</span>
            </Link>
            <Link
              to="/messages"
              className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              <span>Messages</span>
            </Link>
          </>
        )}

        {isCompany && (
          <>
            <Link
              to="/upload-job"
              className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              <span>Post Job</span>
            </Link>
            <Link
              to="/notifications"
              className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              <span>Notifications</span>
            </Link>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto p-2 text-gray-300 hover:bg-gray-800 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default LeftSidebar;
