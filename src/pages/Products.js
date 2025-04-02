import React from "react";
import ProductList from "../components/ProductList";
import "./styles.css";

const Products = ({ addToCart }) => {
  return (
    <div className="container mt-4">
      <ProductList addToCart={addToCart} />
    </div>
  );
};

export default Products;
