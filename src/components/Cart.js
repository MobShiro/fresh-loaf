import React from "react";
import { Link } from "react-router-dom";

const Cart = ({ cart, setCart }) => {
  // Handle deleting a product from the cart
  const handleDelete = (productId) => {
    setCart(cart.filter((item) => item.id !== productId)); // Remove product completely
  };

  // Handle reducing the quantity of a product
  const handleReduceQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
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
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleReduceQuantity(item.id)}
                >
                  -
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(item.id)}
                >
                  X
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
