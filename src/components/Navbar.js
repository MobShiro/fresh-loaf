import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ cart = [] }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [homeClickCount, setHomeClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const navigate = useNavigate();
  
  // Reset click count after timeout
  useEffect(() => {
    const clickTimeout = setTimeout(() => {
      if (homeClickCount > 0) {
        setHomeClickCount(0);
      }
    }, 2000); // Reset after 2 seconds of inactivity
    
    return () => clearTimeout(clickTimeout);
  }, [homeClickCount]);
  
  const handleHomeClick = (e) => {
    e.preventDefault();
    
    const currentTime = new Date().getTime();
    // Only count clicks that happen within 2 seconds of each other
    if (currentTime - lastClickTime < 2000 || homeClickCount === 0) {
      const newCount = homeClickCount + 1;
      setHomeClickCount(newCount);
      
      if (newCount >= 4) {
        // Navigate to admin login after 4 clicks
        navigate("/admin/login");
        return; // Add this return to prevent going to home page
      } else {
        // Normal navigation to home for counts less than 4
        navigate("/");
      }
    } else {
      // Reset count if clicking after timeout
      setHomeClickCount(1);
      navigate("/");
    }
    
    setLastClickTime(currentTime);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">FreshLoaf</Link>
        <div className="d-flex align-items-center">
          <a className="btn btn-outline-light me-2" href="/" onClick={handleHomeClick}>Home</a>
          
          {isAuthenticated && (
            <>
              <Link className="btn btn-outline-light me-2" to="/products">Products</Link>
              <Link className="btn btn-outline-light me-2" to="/orders">Orders</Link>
              <Link className="btn btn-outline-light me-2" to="/order-summary">
                Cart ({cart ? cart.length : 0})
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <div className="d-flex align-items-center">
              <span className="text-light me-3">
                Hello, {currentUser.displayName || currentUser.email}
              </span>
              <button 
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
              <Link className="btn btn-outline-primary" to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
