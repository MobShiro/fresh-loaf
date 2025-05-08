import React from "react";
import ProductList from "../components/ProductList";
import { motion } from "framer-motion";
import "./styles.css";

const Products = ({ addToCart }) => {
  return (
    <motion.div 
      className="products-container mt-5 pt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ProductList addToCart={addToCart} />
    </motion.div>
  );
};

export default Products;
