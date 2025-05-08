import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import "../styles.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Admin User");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupKey, setSetupKey] = useState("");
  const navigate = useNavigate();

  // This is a simple setup key for first-time admin registration
  // In a production app, use a more secure method
  const ADMIN_SETUP_KEY = "freshloaf2025";

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Then check if user has admin role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (userData?.isAdmin) {
        // Store admin status in localStorage
        localStorage.setItem("adminAuth", JSON.stringify({ 
          isAdmin: true,
          uid: user.uid
        }));
        
        // Small delay to ensure localStorage is set before redirect
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 100);
      } else {
        // If not admin, sign out and show error
        await signOut(auth);
        setError("You don't have admin privileges");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid login credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    
    // Verify setup key
    if (setupKey !== ADMIN_SETUP_KEY) {
      setError("Invalid setup key");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Register new admin user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create admin user document in Firestore with isAdmin flag
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: name,
        isAdmin: true,
        createdAt: serverTimestamp()
      });
      
      // Store admin status in localStorage
      localStorage.setItem("adminAuth", JSON.stringify({
        isAdmin: true,
        uid: user.uid
      }));
      
      // Add a small delay to ensure localStorage is set before redirect
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 100);
      
    } catch (error) {
      console.error("Admin setup error:", error);
      setError(error.message || "Failed to set up admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <h2 className="text-center mb-4">Admin {isSetupMode ? "Setup" : "Login"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!isSetupMode ? (
          // Login Form
          <form onSubmit={handleAdminLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <div className="text-center mt-3">
              <button 
                type="button" 
                className="btn btn-link"
                onClick={() => setIsSetupMode(true)}
              >
                First time setup? Create admin account
              </button>
            </div>
          </form>
        ) : (
          // Admin Setup Form
          <form onSubmit={handleAdminSetup}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Admin Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="setupEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="setupEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="setupPassword" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="setupPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <small className="form-text text-muted">
                Password must be at least 6 characters.
              </small>
            </div>
            <div className="mb-4">
              <label htmlFor="setupKey" className="form-label">
                Setup Key
              </label>
              <input
                type="password"
                className="form-control"
                id="setupKey"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                required
              />
              <small className="form-text text-muted">
                Enter the administrator setup key.
              </small>
            </div>
            <button
              type="submit"
              className="btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Setting up..." : "Create Admin Account"}
            </button>
            
            <div className="text-center mt-3">
              <button 
                type="button" 
                className="btn btn-link"
                onClick={() => setIsSetupMode(false)}
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;