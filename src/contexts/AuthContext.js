import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [authStateChecked, setAuthStateChecked] = useState(false);

  // Clear any auth errors
  const setError = (message) => {
    setAuthError(message);
    // Auto-clear errors after 5 seconds
    if (message) {
      setTimeout(() => setAuthError(""), 5000);
    }
  };

  // Register new user
  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        displayName: name,
        createdAt: serverTimestamp(),
        isOnline: true,
        lastSeen: serverTimestamp()
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
      throw error;
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in");
      }
      
      // Update user online status
      if (userCredential.user) {
        await updateDoc(doc(db, "users", userCredential.user.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        }).catch(e => console.warn("Could not update online status:", e));
      }
      
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      
      // Make error messages more user-friendly
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  // Send verification email (can be used to resend verification email)
  const verifyEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser);
        return true;
      } catch (error) {
        console.error("Error sending verification:", error);
        setError("Could not send verification email. Please try again later.");
        throw error;
      }
    }
    return false;
  };

  // Check verification status - refresh user data
  const checkVerificationStatus = useCallback(async () => {
    if (!currentUser) return false;
    
    try {
      await currentUser.reload();
      const isVerified = currentUser.emailVerified;
      setVerificationStatus(isVerified);
      return isVerified;
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  }, [currentUser]);

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send password reset email. Please check if the email is correct.");
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      // Update user status to offline before signing out
      if (currentUser) {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            isOnline: false,
            lastSeen: serverTimestamp()
          });
        } catch (e) {
          console.warn("Could not update offline status:", e);
        }
      }
      
      // Clear any cached auth data
      localStorage.removeItem("adminAuth");
      
      return signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  // Update user online status - more reliable with error handling
  const updateOnlineStatus = async (user, isOnline) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          isOnline: isOnline,
          lastSeen: serverTimestamp()
        });
      }
    } catch (error) {
      console.warn("Error updating online status:", error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      if (user) {
        setCurrentUser(user);
        setVerificationStatus(user.emailVerified);
        
        // Update online status when user logs in
        updateOnlineStatus(user, true).catch(console.warn);
        
        // Set up presence system with window events
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            updateOnlineStatus(user, true);
          } else {
            updateOnlineStatus(user, false);
          }
        };
        
        // Track visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Fix issue where cleanup wasn't returning properly
        if (mounted) {
          setAuthStateChecked(true);
          setLoading(false);
        }
        
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } else {
        // No user logged in
        setCurrentUser(null);
        setVerificationStatus(false);
        
        if (mounted) {
          setAuthStateChecked(true);
          setLoading(false);
        }
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Handle page unload to update offline status
  useEffect(() => {
    const handleUnload = () => {
      // Using sync localStorage to flag user as offline
      // This is more reliable than async Firestore calls on page unload
      if (currentUser?.uid) {
        localStorage.setItem('user_offline_' + currentUser.uid, Date.now());
        
        // We'll still try the async call but it may not complete
        updateOnlineStatus(currentUser, false).catch(console.warn);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser]);

  // Check if user is marked as offline in localStorage and fix it
  useEffect(() => {
    if (currentUser?.uid && authStateChecked) {
      const offlineKey = 'user_offline_' + currentUser.uid;
      if (localStorage.getItem(offlineKey)) {
        // User was marked offline, let's update to online
        updateOnlineStatus(currentUser, true);
        localStorage.removeItem(offlineKey);
      }
    }
  }, [currentUser, authStateChecked]);

  // Auto check verification status every minute if logged in but not verified
  useEffect(() => {
    let verificationInterval;
    
    if (currentUser && !currentUser.emailVerified) {
      verificationInterval = setInterval(async () => {
        await checkVerificationStatus();
      }, 60000);
    }
    
    return () => {
      if (verificationInterval) clearInterval(verificationInterval);
    };
  }, [currentUser, checkVerificationStatus]);

  // Context value to be provided
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified,
    verificationStatus,
    error: authError,
    setError,
    register,
    login,
    logout,
    verifyEmail,
    resetPassword,
    checkVerificationStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}