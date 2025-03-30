import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import OrderSummary from "./components/OrderSummary";
import Cart from "./components/Cart";

const App = () => {
  const [cart, setCart] = useState([]);

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

  return (
    <Router>
      <Navbar cart={cart} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products addToCart={addToCart} />} />
        <Route path="/order-summary" element={<OrderSummary cart={cart} />} />
      </Routes>
    </Router>
  );
};

export default App;
