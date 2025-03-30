import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ cart }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckout(true);
    setTimeout(() => {
      navigate("/"); 
    }, 3000);
  };

  const handleBack = () => {
    navigate("/products");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Order Summary</h2>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <div className="order-summary bg-light p-4 rounded">
          {!isCheckout ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>SubTotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4 className="text-center">Total: ${totalPrice.toFixed(2)}</h4>
              <div className="text-center">
                <button className="btn btn-success me-2" onClick={handleCheckout}>
                  Checkout
                </button>
                <button className="btn btn-secondary" onClick={handleBack}>
                  Back
                </button>
              </div>
            </>
          ) : (
            <h3 className="text-center text-success">
              Your order is on the way! 🚚
            </h3>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
