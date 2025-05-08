import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../pages/styles.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("adminAuth");
        navigate("/admin/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-md-3">
              <div className="admin-logo">
                <h1>Fresh Loaf</h1>
                <div className="admin-badge">Admin Panel</div>
              </div>
            </div>
            <div className="col-md-6">
              <h2 className="admin-title text-center mb-0">Administrator Dashboard</h2>
            </div>
            <div className="col-md-3 text-end">
              <button className="btn btn-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="admin-content">
        {children}
      </div>

      {/* Admin Footer */}
      <footer className="admin-footer">
        <div className="container">
          <div className="text-center py-3">
            <p className="mb-0">© {new Date().getFullYear()} Fresh Loaf Admin Panel</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;