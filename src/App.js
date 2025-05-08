import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import OrderSummary from "./components/OrderSummary";
import Cart from "./components/Cart"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Orders from "./pages/Orders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "./pages/styles.css";

// Loading fallback component
const LoadingFallback = () => (
  <div className="text-center mt-5 pt-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3">Loading Fresh Loaf...</p>
  </div>
);

// Main layout with navbar for customer-facing pages
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Error boundary for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center mt-5 pt-5">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [cart, setCart] = useState([]);
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('freshLoafCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      
      // Simulate a small delay to ensure all resources are loaded
      const readyTimer = setTimeout(() => {
        setIsAppReady(true);
      }, 200);
      
      return () => clearTimeout(readyTimer);
    } catch (error) {
      console.error("Error loading saved cart:", error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('freshLoafCart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.name === product.name);
      if (index !== -1) {
        const newCart = [...prevCart];
        newCart[index].quantity += 1;
        return newCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  if (!isAppReady) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Admin Routes with AdminLayout */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </AdminProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                </Route>
                
                {/* Admin Login (no layout) */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Customer Routes with MainLayout */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="verify-email" element={<VerifyEmail />} />
                  <Route path="products" element={
                    <ProtectedRoute>
                      <Products addToCart={addToCart} setCart={setCart} />
                    </ProtectedRoute>
                  } />
                  <Route path="order-summary" element={
                    <ProtectedRoute>
                      <OrderSummary cart={cart} setCart={setCart} />
                    </ProtectedRoute>
                  } />
                  <Route path="cart" element={
                    <ProtectedRoute>
                      <Cart cart={cart} setCart={setCart} />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
