import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./styles.css";

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        // Query orders collection for the current user's orders
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef, 
          where("userId", "==", currentUser.uid),
          orderBy("orderDate", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        const userOrders = [];
        querySnapshot.forEach((doc) => {
          userOrders.push({
            id: doc.id,
            ...doc.data(),
            orderDate: doc.data().orderDate?.toDate() || new Date()
          });
        });
        
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order === selectedOrder ? null : order);
  };

  // Format date to readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'processing':
        return 'badge bg-warning text-dark';
      case 'shipped':
        return 'badge bg-info text-dark';
      case 'delivered':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="container mt-5 pt-5 orders-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h1 
        className="text-center mb-4 page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Orders
      </motion.h1>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div 
          className="text-center py-5 empty-orders"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <i className="bi bi-bag-x empty-orders-icon"></i>
            <h3 className="mt-3">No Orders Yet</h3>
            <p className="mb-4">You haven't placed any orders yet.</p>
            <motion.a 
              href="/products" 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Products
            </motion.a>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="row"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {orders.map((order) => (
            <motion.div 
              key={order.id} 
              className="col-12 mb-4"
              variants={itemVariants}
            >
              <div 
                className={`order-card ${selectedOrder?.id === order.id ? 'expanded' : ''}`}
                onClick={() => handleOrderClick(order)}
              >
                <div className="order-card-header">
                  <div className="order-info">
                    <h3 className="order-id">Order #{order.id.slice(-6)}</h3>
                    <p className="order-date">Placed on: {formatDate(order.orderDate)}</p>
                  </div>
                  <div className="order-status-price">
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="order-total">${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <motion.div 
                    className="order-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="order-items">
                      <h4>Order Items</h4>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="order-summary-details row mt-4">
                      <div className="col-md-6">
                        <div className="shipping-details">
                          <h4>Shipping Details</h4>
                          <p><strong>Name:</strong> {order.customerDetails.name}</p>
                          <p><strong>Email:</strong> {order.customerDetails.email}</p>
                          <p><strong>Phone:</strong> {order.customerDetails.phone}</p>
                          <p><strong>Address:</strong> {order.customerDetails.address}</p>
                          {order.customerDetails.notes && (
                            <p><strong>Notes:</strong> {order.customerDetails.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="payment-summary">
                          <h4>Payment Summary</h4>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tax:</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Delivery Fee:</span>
                            <span>${order.deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between order-total-line">
                            <strong>Total:</strong>
                            <strong>${order.totalPrice.toFixed(2)}</strong>
                          </div>
                          <div className="mt-3">
                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="order-actions mt-4 text-center">
                      <button className="btn btn-outline-primary me-2">
                        <i className="bi bi-printer me-2"></i>
                        Print Receipt
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-question-circle me-2"></i>
                        Help with Order
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {selectedOrder?.id !== order.id && (
                  <div className="order-preview">
                    <p className="mb-0">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      <span className="expand-hint ms-3">
                        Click to view details
                        <i className="bi bi-chevron-down ms-2"></i>
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Orders;