import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, checkVerificationStatus, loading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  // Check verification status when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const verifyUser = async () => {
      try {
        if (currentUser) {
          await checkVerificationStatus();
        }
        
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };
    
    // Short timeout to ensure auth state is settled
    const timer = setTimeout(() => {
      verifyUser();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentUser, checkVerificationStatus]);

  // Show loading state while checking auth
  if (loading || isCheckingAuth) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Checking authentication...</p>
      </div>
    );
  }

  // If not logged in, redirect to login with return path
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If logged in but email not verified, redirect to verification page
  if (currentUser && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Otherwise render the protected component
  return children;
};

export default ProtectedRoute;