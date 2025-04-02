import React from "react";
import { Link } from "react-router-dom";

const Cart = ({ cart, setCart }) => {
  const handleDelete = (productId) => {
    setCart(cart.filter((item) => item.id !== productId)); 
  };

  const handleReduceQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <ul className="list-group">
          {cart.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{item.name} - ${item.price.toFixed(2)} x {item.quantity}</span>
              <div>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleReduceQuantity(item.id)}
                >
                  Reduce Quantity
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Remove Item
                </button>
              </div>
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
