import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async (user) => {
      try {
        // First check localStorage for admin auth
        const adminAuth = localStorage.getItem('adminAuth');
        
        if (adminAuth) {
          const parsedAuth = JSON.parse(adminAuth);
          
          // If we have admin auth in localStorage and current user matches
          if (parsedAuth?.isAdmin && parsedAuth?.uid === user?.uid) {
            if (isMounted) {
              setIsAdmin(true);
              setIsCheckingAuth(false);
            }
            return;
          }
        }
        
        // If no valid admin auth in localStorage, check Firestore
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          
          if (userData?.isAdmin) {
            // Update localStorage
            localStorage.setItem('adminAuth', JSON.stringify({
              isAdmin: true,
              uid: user.uid
            }));
            
            if (isMounted) {
              setIsAdmin(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user);
      } else {
        if (isMounted) {
          setIsCheckingAuth(false);
          setIsAdmin(false);
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Verifying admin access...</p>
      </div>
    );
  }

  // If not admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  
  // If admin, render the admin dashboard
  return children;
};

export default AdminProtectedRoute;