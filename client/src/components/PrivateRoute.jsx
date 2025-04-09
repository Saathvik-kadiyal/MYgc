import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render the protected route
  return children;
};

export default PrivateRoute; 