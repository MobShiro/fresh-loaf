import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import "../pages/styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const navigate = useNavigate();
  const { login, resetPassword, error, setError } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const user = await login(email, password);
      
      if (!user.emailVerified) {
        // Redirect to verification page if email isn't verified
        navigate("/verify-email");
      } else {
        // Redirect straight to products page instead of home
        navigate("/products");
      }
    } catch (err) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      await resetPassword(email);
      setResetSent(true);
      setError("");
    } catch (err) {
      // Error is handled in AuthContext
    }
  };

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="auth-form-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants} className="text-center mb-4">Welcome to Fresh Loaf</motion.h2>
        
        {error && (
          <motion.div 
            className="alert alert-danger"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {resetSent && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Password reset email has been sent!
          </motion.div>
        )}
        
        <motion.form variants={itemVariants} onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <motion.button 
            type="submit" 
            className="btn btn-primary w-100 mb-3" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : "Login"}
          </motion.button>
        </motion.form>
        
        <motion.div variants={itemVariants} className="text-center mb-3">
          <button 
            onClick={handleForgotPassword} 
            className="btn btn-link text-decoration-none"
          >
            Forgot Password?
          </button>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-center">
          Don't have an account? <Link to="/register" className="register-link">Register</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;