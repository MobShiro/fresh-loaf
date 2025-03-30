import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ cart }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">FreshLoaf</Link>
        <div>
          <Link className="btn btn-outline-light me-2" to="/">Home</Link>
          <Link className="btn btn-outline-light me-2" to="/products">Products</Link>
          <Link className="btn btn-outline-light" to="/order-summary">
            Cart ({cart.length})
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
