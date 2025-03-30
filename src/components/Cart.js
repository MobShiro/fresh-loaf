import React from "react";
import { Link } from "react-router-dom";

const Cart = ({ cart }) => {
  return (
    <div className="container mt-4">
      <h2 className="text-center">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <ul className="list-group">
          {cart.map((item, index) => (
            <li key={index} className="list-group-item">
              {item.name} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}

      <div className="text-center mt-4">
        <Link to="/">
          <button className="btn btn-secondary">Back to Products</button>
        </Link>
      </div>
    </div>
  );
};

export default Cart;
