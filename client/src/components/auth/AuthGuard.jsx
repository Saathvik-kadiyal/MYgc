import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Navigate } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { fetchCurrentUserProfile } from '../../store/slices/userSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading, error: authError } = useSelector((state) => state.auth || { isAuthenticated: false, loading: false, error: null });
  const { loading: profileLoading, currentProfile } = useSelector((state) => state.user || { loading: false, currentProfile: null });
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const authCheckRef = useRef(false);
  const profileFetchRef = useRef(false);
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0);
  const maxAuthCheckAttempts = 3;

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/creator-type',
    '/signup',
    '/login',
    '/verify-otp',
    '/onboarding'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const checkAuth = useCallback(async () => {
    if (!authCheckRef.current) {
      authCheckRef.current = true;
      try {
        console.log('Checking authentication status...');
        // Check authentication status
        const result = await dispatch(checkAuthStatus()).unwrap();
        
        // If authenticated and we don't have a profile yet, fetch the current user's profile
        if (result && !currentProfile && !profileFetchRef.current) {
          console.log('Fetching current user profile...');
          profileFetchRef.current = true;
          await dispatch(fetchCurrentUserProfile()).unwrap();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear any auth state if the check fails
        dispatch({ type: 'auth/clearAuthState' });
        
        // Increment the auth check attempts counter
        setAuthCheckAttempts(prev => prev + 1);
        
        // If we've exceeded the maximum number of attempts, reset the ref to allow another attempt
        if (authCheckAttempts >= maxAuthCheckAttempts) {
          console.log('Exceeded maximum auth check attempts, resetting...');
          authCheckRef.current = false;
          setAuthCheckAttempts(0);
        }
      } finally {
        setInitialCheckDone(true);
      }
    }
  }, [dispatch, currentProfile, authCheckAttempts]);

  useEffect(() => {
    let isMounted = true;

    const performAuthCheck = async () => {
      if (!isMounted) return;
      await checkAuth();
    };

    performAuthCheck();

    return () => {
      isMounted = false;
    };
  }, [checkAuth]);

  // Show loading spinner until initial authentication check is complete
  if (!initialCheckDone || authLoading || (isAuthenticated && !currentProfile && profileLoading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated and trying to access a public route, redirect to feed
  if (isAuthenticated && isPublicRoute && location.pathname !== '/') {
    return <Navigate to="/feed" replace />;
  }

  // For public routes, render children without authentication check
  if (isPublicRoute) {
    return children;
  }

  // For protected routes, redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For protected routes, render children
  return children;
};

export default AuthGuard; 