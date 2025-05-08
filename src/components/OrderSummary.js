import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const OrderSummary = ({ cart, setCart }) => {
  const { currentUser } = useAuth();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  
  // Customer details form
  const [customerDetails, setCustomerDetails] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    notes: "",
  });

  // Order summary calculation
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 0 ? 2.50 : 0;
  const totalPrice = subtotal + tax + deliveryFee;

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
  
  const handleIncreaseQuantity = (productId) => {
    setCart(cart.map((item) => 
      item.id === productId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = () => {
    setIsCheckout(true);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Create order object
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity
      }));
      
      const orderData = {
        userId: currentUser.uid,
        customerDetails,
        items: orderItems,
        subtotal,
        tax,
        deliveryFee,
        totalPrice,
        status: 'processing',
        orderDate: serverTimestamp(),
        paymentMethod: 'Cash on Delivery' // Default payment method
      };
      
      // Save to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      
      // Update state to show order confirmation
      setOrderId(orderRef.id);
      setOrderPlaced(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        setCart([]);
        // Redirect to orders page after a short delay
        setTimeout(() => navigate("/orders"), 3000);
      }, 1000);
      
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (isCheckout && !orderPlaced) {
      setIsCheckout(false);
    } else {
      navigate("/products");
    }
  };

  const handleContinueShopping = () => {
    setCart([]);
    navigate("/products");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.5 }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (orderPlaced) {
    // Order confirmation view
    return (
      <motion.div 
        className="container mt-5 pt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="order-confirmation">
          <div className="order-confirmation-content">
            <div className="order-confirmation-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <motion.h2 
              className="text-success text-center mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              Order Placed Successfully!
            </motion.h2>
            
            <div className="order-confirmation-details">
              <p className="order-id">Order ID: <span>{orderId}</span></p>
              <p className="order-message">
                Thank you for your order! We've received your order and will begin processing it right away.
                You'll receive a confirmation email shortly.
              </p>
              
              <div className="order-summary-box">
                <h4>Order Summary</h4>
                <div className="order-summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.name} x {item.quantity}</span>
                      <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-totals">
                  <div className="order-total-line">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="order-total-line">
                    <span>Tax (5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="order-total-line">
                    <span>Delivery Fee:</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="order-total-line total">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="delivery-info">
                <h4>Delivery Information</h4>
                <p><strong>Name:</strong> {customerDetails.name}</p>
                <p><strong>Email:</strong> {customerDetails.email}</p>
                <p><strong>Phone:</strong> {customerDetails.phone}</p>
                <p><strong>Address:</strong> {customerDetails.address}</p>
                {customerDetails.notes && (
                  <p><strong>Notes:</strong> {customerDetails.notes}</p>
                )}
              </div>
              
              <div className="text-center mt-4">
                <motion.button 
                  className="btn btn-primary"
                  onClick={handleContinueShopping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Shopping
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mt-5 pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h2 
        className="text-center mb-4 order-summary-title"
        variants={itemVariants}
      >
        {isCheckout ? "Checkout" : "Your Cart"}
      </motion.h2>

      {cart.length === 0 ? (
        <motion.div 
          className="text-center empty-cart"
          variants={itemVariants}
        >
          <div className="empty-cart-icon">
            <i className="bi bi-cart-x"></i>
          </div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <motion.button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/products')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Products
          </motion.button>
        </motion.div>
      ) : (
        <div className="row">
          <div className={`col-lg-${isCheckout ? '8' : '12'}`}>
            {!isCheckout ? (
              // Cart View
              <motion.div 
                className="cart-container"
                variants={itemVariants}
              >
                <div className="table-responsive">
                  <table className="table cart-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id} className="cart-item-row">
                          <td className="cart-product-info">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <span className="cart-item-name">{item.name}</span>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <div className="quantity-controls">
                              <button 
                                className="btn btn-sm btn-quantity" 
                                onClick={() => handleReduceQuantity(item.id)}
                                disabled={item.quantity <= 1}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="quantity-display">{item.quantity}</span>
                              <button 
                                className="btn btn-sm btn-quantity" 
                                onClick={() => handleIncreaseQuantity(item.id)}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-remove" 
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="cart-summary">
                  <div className="cart-summary-content">
                    <div className="cart-totals">
                      <div className="cart-total-line">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="cart-total-line">
                        <span>Tax (5%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="cart-total-line">
                        <span>Delivery Fee:</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="cart-total-line total">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="cart-actions">
                      <motion.button 
                        className="btn btn-primary checkout-btn" 
                        onClick={handleCheckout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Proceed to Checkout
                      </motion.button>
                      <motion.button 
                        className="btn btn-outline-secondary" 
                        onClick={handleBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Continue Shopping
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Checkout View - Order Review
              <motion.div 
                className="order-review"
                variants={itemVariants}
              >
                <h3 className="mb-4">Order Review</h3>
                <div className="table-responsive mb-4">
                  <table className="table checkout-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="checkout-product-info">
                            <img src={item.image} alt={item.name} className="checkout-item-image" />
                            <span className="checkout-item-name">{item.name}</span>
                          </td>
                          <td>{item.quantity}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
          
          {isCheckout && (
            <div className="col-lg-4">
              <motion.div 
                className="checkout-form-container"
                variants={itemVariants}
              >
                <h3 className="mb-4">Customer Details</h3>
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      name="name"
                      value={customerDetails.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      name="email"
                      value={customerDetails.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="phone" 
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Delivery Address</label>
                    <textarea 
                      className="form-control" 
                      id="address" 
                      name="address"
                      rows="3"
                      value={customerDetails.address}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Order Notes (Optional)</label>
                    <textarea 
                      className="form-control" 
                      id="notes"
                      name="notes" 
                      rows="2"
                      value={customerDetails.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="order-summary-box checkout">
                    <h4>Order Summary</h4>
                    <div className="checkout-totals">
                      <div className="checkout-total-line">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="checkout-total-line">
                        <span>Tax (5%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="checkout-total-line">
                        <span>Delivery Fee:</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="checkout-total-line total">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="checkout-actions mt-4">
                    <motion.button 
                      type="button" 
                      className="btn btn-primary place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address}
                      whileHover={!isProcessing && { scale: 1.05 }}
                      whileTap={!isProcessing && { scale: 0.95 }}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : "Place Order"}
                    </motion.button>
                    <motion.button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleBack}
                      disabled={isProcessing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back to Cart
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default OrderSummary;
