import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

// Cache clearing mechanism
const clearStaleCache = () => {
  try {
    // Check for outdated cache version
    const currentCacheKey = process.env.REACT_APP_CACHE_CLEAR_KEY || 'freshloaf_20250508';
    const storedCacheKey = localStorage.getItem('appCacheKey');
    
    if (storedCacheKey !== currentCacheKey) {
      console.log("Clearing stale cache data...");
      
      // Clear localStorage items except specific ones we want to keep
      const itemsToKeep = ['freshLoafCart'];
      
      Object.keys(localStorage).forEach(key => {
        if (!itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage completely
      sessionStorage.clear();
      
      // Update cache version
      localStorage.setItem('appCacheKey', currentCacheKey);
      
      // Update any version-specific flags
      localStorage.setItem('appVersion', process.env.REACT_APP_VERSION || '1.0.0');
      
      // Try to reload the page to ensure fresh state (in development only)
      if (process.env.NODE_ENV === 'development') {
        window.location.reload();
      }
    }
  } catch (error) {
    console.error("Error during cache clearing:", error);
  }
};

// Execute cache clearing
clearStaleCache();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
