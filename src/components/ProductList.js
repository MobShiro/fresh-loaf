import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../pages/styles.css';

const products = [
  // Breads
  { name: "Banana Bread", price: 5.00, image: "/img/Banana Bread.jpg", category: "Breads" },
  { name: "Baguette", price: 4.00, image: "/img/bagguette.jpg", category: "Breads" },
  { name: "Ensaymada", price: 2.50, image: "/img/Ensaymada.jpg", category: "Breads" },
  { name: "Ham and Cheese Bread", price: 8.75, image: "/img/cheese.jpg", category: "Breads" },
  { name: "Fresh Bread", price: 4.00, image: "/img/tasty.jpg", category: "Breads" },
  { name: "Chocolate Brownie", price: 3.50, image: "/img/Chocolate Brownie.jpg", category: "Breads" },
  
  // Drinks
  { name: "Hot Chocolate", price: 3.50, image: "/img/hot.jpg", category: "Drinks" },
  { name: "Classic Coffee", price: 4.50, image: "/img/coffee.jpg", category: "Drinks" },
  { name: "Mocha Latte", price: 4.00, image: "/img/macha.jpg", category: "Drinks" },
  { name: "Strawberry Milkshake", price: 5.75, image: "/img/straw.jpg", category: "Drinks" },
  { name: "Milk", price: 2.00, image: "/img/milk.jpg", category: "Drinks" },
  { name: "Iced Tea", price: 2.00, image: "/img/tea.jpg", category: "Drinks" },
  
  // Desserts
  { name: "Mousse Cake", price: 10.00, image: "/img/cake.jpg", category: "Desserts" },
  { name: "Bibingka", price: 3.00, image: "/img/bibingka.jpg", category: "Desserts" },
  { name: "Leche Flan", price: 10.00, image: "/img/Leche Flan.jpg", category: "Desserts" },
  { name: "Ice Cream", price: 8.75, image: "/img/cream.jpg", category: "Desserts" },
  { name: "Mango Graham", price: 4.00, image: "/img/graham.jpg", category: "Desserts" },
  { name: "Chocolate Cookie", price: 5.00, image: "/img/cookie.jpg", category: "Desserts" },
];

const categories = ["Breads", "Drinks", "Desserts"];

const ProductList = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState("Breads");

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  );

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Pick Your Favorite Delights!</h1>
      
      <div className="bg-white p-3 mb-4">
        <ul className="nav nav-tabs">
          {categories.map((category, idx) => (
            <li className="nav-item" key={idx}>
              <button
                className={`nav-link ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="row">
        {filteredProducts.map((product, index) => (
          <div key={index} className="col-md-4 col-sm-6">
            <div className="card product-card">
              <img src={product.image} className="card-img-top" alt={product.name} />
              <div className="card-body text-center">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">${product.price.toFixed(2)}</p>
                <button className="btn btn-primary" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      

      <div className="order-summary-btn-container mt-4">
        <Link to="/order-summary">
          <button className="btn btn-warning order-summary-btn">Cart</button>
        </Link>
      </div>
    </div>
  );
};

export default ProductList;
