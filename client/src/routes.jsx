import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectCompany, checkAuthStatus } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import OnboardingPage from './pages/OnboardingPage';

// Main Pages
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import SearchOptionsPage from './pages/SearchOptionsPage';
import UploadPostPage from './pages/UploadPostPage';
import UploadJobPage from './pages/UploadJobPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

const ProfileRedirect = () => {
  const user = useSelector(selectUser);
  const company = useSelector(selectCompany);
  
  if (!user && !company) {
    return <Navigate to="/login" replace />;
  }
  
  if (company) {
    return <Navigate to={`/profile/${company.username}`} replace />;
  }
  
  return <Navigate to={`/profile/${user.username}`} replace />;
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isAuthenticated, loading]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/profile">
          <Route path=":username" element={<ProfilePage />} />
          <Route index element={<ProfileRedirect />} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search-options" element={<SearchOptionsPage />} />
        <Route path="/upload" element={<UploadPostPage />} />
        <Route path="/upload-job" element={<UploadJobPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
