import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ cart, setCart }) => {
<<<<<<< HEAD
    const [isCheckout, setIsCheckout] = useState(false);
    const navigate = useNavigate();

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleDelete = (productId) => {
      console.log("Deleting product with ID:", productId);  
      setCart(cart.filter((item) => item.id !== productId));  
    };

    const handleReduceQuantity = (productId) => {
      setCart(cart.map((item) => 
        item.id === productId && item.quantity > 1 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
  };

    const handleCheckout = () => {
      setIsCheckout(true);
      setTimeout(() => {
        navigate("/"); 
      }, 10000);
   };

=======
  const [isCheckout, setIsCheckout] = useState(false);
  const navigate = useNavigate();

  // Calculate the overall total using quantity
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Handle deleting a product from the cart (reducing quantity or removing the item if 0)
  const handleDelete = (productId) => {
    setCart(cart.filter((item) => item.id !== productId)); // Remove product completely
  };

  // Handle reducing the quantity of a product
  const handleReduceQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.id === productId && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };

  // Handle checkout
  const handleCheckout = () => {
    setIsCheckout(true);
    setTimeout(() => {
      navigate("/"); // Redirect to home after 10 seconds
    }, 10000);
  };

  // Back button handler to navigate to the products page
>>>>>>> 183904d7e2899b4cf1c3b27b638c3258972aa825
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn btn-warning btn-sm me-2" 
<<<<<<< HEAD
                          onClick={() => handleReduceQuantity(item.id)} 
=======
                          onClick={() => handleReduceQuantity(item.id)}
>>>>>>> 183904d7e2899b4cf1c3b27b638c3258972aa825
                        >
                          -
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
<<<<<<< HEAD
                          onClick={() => handleDelete(item.id)} 
=======
                          onClick={() => handleDelete(item.id)}
>>>>>>> 183904d7e2899b4cf1c3b27b638c3258972aa825
                        >
                          X
                        </button>
                      </td>
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
