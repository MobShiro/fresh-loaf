import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../pages/styles.css";

const products = [
  { id: 1, name: "Banana Bread", price: 5.00, image: "/img/Banana Bread.jpg", category: "Breads", description: "Sweet and moist banana bread, perfect with coffee" },
  { id: 2, name: "Baguette", price: 4.00, image: "/img/bagguette.jpg", category: "Breads", description: "Traditional French baguette with crispy crust" },
  { id: 3, name: "Ensaymada", price: 2.50, image: "/img/Ensaymada.jpg", category: "Breads", description: "Sweet Filipino pastry topped with butter and sugar" },
  { id: 4, name: "Ham and Cheese Bread", price: 8.75, image: "/img/cheese.jpg", category: "Breads", description: "Savory bread filled with premium ham and cheese" },
  { id: 5, name: "Fresh Bread", price: 4.00, image: "/img/tasty.jpg", category: "Breads", description: "Freshly baked white bread, soft and fluffy" },
  { id: 6, name: "Chocolate Brownie", price: 3.50, image: "/img/Chocolate Brownie.jpg", category: "Breads", description: "Rich chocolate brownies with a fudgy center" },

  { id: 7, name: "Hot Chocolate", price: 3.50, image: "/img/hot.jpg", category: "Drinks", description: "Creamy hot chocolate made with premium cocoa" },
  { id: 8, name: "Classic Coffee", price: 4.50, image: "/img/coffee.jpg", category: "Drinks", description: "Rich and aromatic coffee from premium beans" },
  { id: 9, name: "Mocha Latte", price: 4.00, image: "/img/macha.jpg", category: "Drinks", description: "The perfect blend of espresso, chocolate and milk" },
  { id: 10, name: "Strawberry Milkshake", price: 5.75, image: "/img/straw.jpg", category: "Drinks", description: "Creamy strawberry milkshake with real fruit" },
  { id: 11, name: "Milk", price: 2.00, image: "/img/milk.jpg", category: "Drinks", description: "Fresh, cold milk to complement our pastries" },
  { id: 12, name: "Iced Tea", price: 2.00, image: "/img/tea.jpg", category: "Drinks", description: "Refreshing iced tea with a hint of lemon" },

  { id: 13, name: "Mousse Cake", price: 10.00, image: "/img/cake.jpg", category: "Desserts", description: "Light and airy mousse cake with berry topping" },
  { id: 14, name: "Bibingka", price: 3.00, image: "/img/bibingka.jpg", category: "Desserts", description: "Traditional Filipino rice cake with a hint of coconut" },
  { id: 15, name: "Leche Flan", price: 10.00, image: "/img/Leche Flan.jpg", category: "Desserts", description: "Smooth caramel custard with a perfect texture" },
  { id: 16, name: "Ice Cream", price: 8.75, image: "/img/cream.jpg", category: "Desserts", description: "Homemade ice cream in various flavors" },
  { id: 17, name: "Mango Graham", price: 4.00, image: "/img/graham.jpg", category: "Desserts", description: "Sweet mango dessert with graham crackers" },
  { id: 18, name: "Chocolate Cookie", price: 5.00, image: "/img/cookie.jpg", category: "Desserts", description: "Chocolate chip cookies, crispy outside and soft inside" },
];

const categories = ["Breads", "Drinks", "Desserts"];

const ProductList = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState("Breads");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Filter products based on active category and search term
  const filteredProducts = products.filter(
    (product) => 
      product.category === activeCategory && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    
    // Show temporary notification animation here if desired
  };

  return (
    <div className="shop-container">
      {/* Shop Header */}
      <div className="shop-header">
        <motion.h1 
          className="shop-title text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Fresh Loaf Shop
        </motion.h1>
        <motion.p 
          className="shop-subtitle text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Discover our delicious selection of freshly baked goods
        </motion.p>
      </div>

      {/* Shop Controls */}
      <motion.div 
        className="shop-controls mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group search-bar">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input 
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end">
              <div className="btn-group view-toggle">
                <button 
                  className={`btn ${isGridView ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setIsGridView(true)}
                >
                  <i className="bi bi-grid"></i>
                </button>
                <button 
                  className={`btn ${!isGridView ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setIsGridView(false)}
                >
                  <i className="bi bi-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories Nav */}
      <motion.div 
        className="container category-nav-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <ul className="nav nav-tabs category-nav">
          {categories.map((category, idx) => (
            <li className="nav-item" key={idx}>
              <button
                className={`nav-link category-btn ${activeCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
                {activeCategory === category && (
                  <motion.div 
                    className="nav-indicator"
                    layoutId="nav-indicator"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Product Grid/List View */}
      <div className="container mt-4">
        <motion.div 
          className={`row ${isGridView ? 'product-grid' : 'product-list'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h3>No products found</h3>
              <p>Try another search term or category</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                className={isGridView ? "col-md-4 col-sm-6 mb-4" : "col-12 mb-3"}
                variants={itemVariants}
              >
                <div className={`card product-card ${isGridView ? '' : 'product-card-list'}`}>
                  {isGridView ? (
                    <>
                      <div className="product-image-container">
                        <img 
                          src={product.image} 
                          className="card-img-top product-image" 
                          alt={product.name} 
                        />
                        <div className="product-overlay">
                          <button 
                            className="btn btn-sm btn-light quick-view-btn"
                            onClick={() => openQuickView(product)}
                          >
                            <i className="bi bi-eye"></i> Quick View
                          </button>
                        </div>
                      </div>
                      <div className="card-body text-center">
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-price">${product.price.toFixed(2)}</p>
                        <motion.button 
                          className="btn btn-primary add-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="row no-gutters">
                      <div className="col-md-3">
                        <img 
                          src={product.image} 
                          className="product-image-list" 
                          alt={product.name} 
                        />
                      </div>
                      <div className="col-md-7 d-flex flex-column justify-content-center py-3 px-4">
                        <h5 className="card-title mb-2">{product.name}</h5>
                        <p className="card-text mb-2 product-description">{product.description}</p>
                        <p className="card-price">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="col-md-2 d-flex flex-column justify-content-center align-items-center">
                        <motion.button 
                          className="btn btn-primary add-cart-btn mb-2"
                          onClick={() => handleAddToCart(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="bi bi-cart-plus"></i>
                        </motion.button>
                        <motion.button 
                          className="btn btn-outline-secondary quick-view-btn-list"
                          onClick={() => openQuickView(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="bi bi-eye"></i>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Cart Button */}
      <div className="container">
        <div className="cart-floating-container">
          <Link to="/order-summary">
            <motion.button 
              className="btn btn-warning cart-floating-btn"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bi bi-cart3 me-2"></i>
              View Cart
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <motion.div 
          className="quick-view-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="quick-view-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <button className="quick-view-close" onClick={closeQuickView}>
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="row">
              <div className="col-md-6">
                <img 
                  src={selectedProduct.image} 
                  className="quick-view-image" 
                  alt={selectedProduct.name} 
                />
              </div>
              <div className="col-md-6">
                <div className="quick-view-details">
                  <h2>{selectedProduct.name}</h2>
                  <p className="quick-view-price">${selectedProduct.price.toFixed(2)}</p>
                  <p className="quick-view-description">{selectedProduct.description}</p>
                  <motion.button 
                    className="btn btn-primary add-cart-btn w-100"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      closeQuickView();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductList;
