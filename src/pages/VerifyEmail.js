import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import "../pages/styles.css";

const VerifyEmail = () => {
  const { currentUser, verifyEmail, error, setError, checkVerificationStatus } = useAuth();
  const [message, setMessage] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Auto-check verification status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkVerificationStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [checkVerificationStatus]);

  const handleResendVerification = async () => {
    try {
      setError("");
      setMessage("");
      
      if (!currentUser) {
        setError("No user is currently signed in");
        return;
      }
      
      await verifyEmail();
      setMessage("Verification email has been sent to your email address");
      setResendDisabled(true);
      setCountdown(60); // Cooldown period of 60 seconds
      
    } catch (err) {
      // Error is handled in AuthContext
    }
  };

  const refreshStatus = async () => {
    try {
      setChecking(true);
      setMessage("");
      setError("");
      
      if (currentUser) {
        const isVerified = await checkVerificationStatus();
        if (isVerified) {
          setMessage("Your email has been verified! Redirecting to shop...");
          setTimeout(() => navigate("/products"), 2000);
        } else {
          setMessage("Email not verified yet. Please check your inbox and click the verification link.");
        }
      }
    } catch (err) {
      setError("Error checking verification status: " + err.message);
    } finally {
      setChecking(false);
    }
  };

  if (!currentUser) {
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
          <motion.h2 variants={itemVariants}>Email Verification</motion.h2>
          <motion.p variants={itemVariants}>You need to be signed in to verify your email.</motion.p>
          <motion.div variants={itemVariants}>
            <Link to="/login" className="btn btn-primary w-100">Go to Login</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="auth-form-container verify-email-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants} className="mb-4">Email Verification</motion.h2>
        
        {error && (
          <motion.div 
            className="alert alert-danger"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {message && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="text-center mb-4 verification-info">
          <div className="verification-icon mb-3">
            <i className="bi bi-envelope-check fs-1"></i>
          </div>
          <p>
            A verification email has been sent to <strong>{currentUser.email}</strong>
          </p>
          <p>
            Please check your inbox (and spam folder) and click the verification link to complete your registration.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="d-grid gap-3">
          <button 
            className={`btn btn-primary verification-btn ${checking ? 'checking' : ''}`} 
            onClick={refreshStatus}
            disabled={checking}
          >
            {checking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Checking...
              </>
            ) : (
              "I've Verified My Email"
            )}
          </button>
          
          <button 
            className="btn btn-outline-secondary verification-btn" 
            onClick={handleResendVerification}
            disabled={resendDisabled}
          >
            {resendDisabled 
              ? `Resend Email (${countdown}s)` 
              : "Resend Verification Email"}
          </button>
          
          <Link to="/login" className="btn btn-outline-dark verification-btn">
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default VerifyEmail;