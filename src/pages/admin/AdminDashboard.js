import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "../styles.css";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/admin/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (!userData?.isAdmin) {
          navigate("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/admin/login");
      }
    };
    
    checkAdminAuth();
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/admin/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Fetch orders and users data with real-time updates
  useEffect(() => {
    let ordersUnsubscribe = null;
    let usersUnsubscribe = null;
    
    const setupRealTimeListeners = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Make sure user is authenticated and is admin
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Not authenticated");
        }
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (!userData?.isAdmin) {
          throw new Error("Not authorized");
        }
        
        // Real-time listener for orders
        const ordersCollection = collection(db, "orders");
        ordersUnsubscribe = onSnapshot(
          ordersCollection,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Make sure we have consistent field names for rendering
                orderDate: data.orderDate || data.timestamp || null,
                totalPrice: data.totalPrice || data.totalAmount || 0,
                status: data.status || "Processing"
              };
            });
            
            // Sort orders by date, newest first
            ordersData.sort((a, b) => {
              if (!a.orderDate && !b.orderDate) return 0;
              if (!a.orderDate) return 1;
              if (!b.orderDate) return -1;
              return b.orderDate.seconds - a.orderDate.seconds;
            });
            
            setOrders(ordersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error in orders listener:", error);
            setError("Failed to get real-time order updates.");
            setLoading(false);
          }
        );
        
        // Real-time listener for users
        const usersCollection = collection(db, "users");
        usersUnsubscribe = onSnapshot(
          usersCollection,
          (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            
            setUsers(usersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error in users listener:", error);
            setError("Failed to get real-time user updates.");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up real-time listeners:", error);
        setError(error.message || "Failed to set up real-time updates.");
        setLoading(false);
      }
    };
    
    setupRealTimeListeners();
    
    // Clean up listeners when component unmounts
    return () => {
      if (ordersUnsubscribe) ordersUnsubscribe();
      if (usersUnsubscribe) usersUnsubscribe();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      // No need to update local state manually as the onSnapshot listener will handle that
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        const orderRef = doc(db, "orders", orderId);
        await deleteDoc(orderRef);
        // No need to update local state manually as the onSnapshot listener will handle that
      } catch (error) {
        console.error("Error deleting order:", error);
        setError("Failed to delete order. Please try again.");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        // Delete from Firestore
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        
        // Delete the user's orders as well
        const ordersCollection = collection(db, "orders");
        const userOrdersQuery = query(ordersCollection, where("userId", "==", userId));
        const userOrdersSnapshot = await getDocs(userOrdersQuery);
        
        const deletePromises = userOrdersSnapshot.docs.map(orderDoc => 
          deleteDoc(doc(db, "orders", orderDoc.id))
        );
        
        await Promise.all(deletePromises);
        
        // Note: Deleting the actual Firebase Auth user account requires admin SDK access
        // which can't be done directly from the client. In a production app,
        // this would be handled via a secure admin-only Cloud Function
        
        // No need to update local state manually as the onSnapshot listeners will handle that
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    signOut(auth).then(() => {
      navigate("/admin/login");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Admin Dashboard</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders Management
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              User Management
            </button>
          </li>
        </ul>

        {activeTab === "orders" ? (
          <div className="orders-section">
            <h3>Orders ({orders.length})</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{order.userId || "Guest"}</td>
                      <td>
                        {order.orderDate
                          ? new Date(order.orderDate.seconds * 1000).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>${order.totalPrice?.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "Completed"
                              ? "bg-success"
                              : order.status === "Processing"
                              ? "bg-warning"
                              : "bg-secondary"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleUpdateOrderStatus(order.id, "Processing")}
                          >
                            Processing
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleUpdateOrderStatus(order.id, "Completed")}
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="users-section">
            <h3>Users ({users.length})</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id.substring(0, 8)}...</td>
                      <td>{user.email}</td>
                      <td>{user.displayName || "N/A"}</td>
                      <td>{user.isAdmin ? "Admin" : "User"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.isAdmin} // Prevent deleting admin users
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;