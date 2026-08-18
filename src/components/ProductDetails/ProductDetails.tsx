"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import styles from "./ProductDetails.module.css";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({
  product,
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0]
  );

  const [quantity, setQuantity] = useState(1);

  function handleAddToCart() {
    addToCart(product, selectedSize, quantity);

    alert("Produto adicionado ao carrinho!");
  }

  function increaseQuantity() {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  return (
    <>
      <div className={styles.option}>
        <h2>Tamanho</h2>

        <div className={styles.sizes}>
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={
                selectedSize === size
                  ? styles.selected
                  : ""
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.option}>
        <h2>Quantidade</h2>

        <div className={styles.quantity}>
          <button onClick={decreaseQuantity}>
            -
          </button>

          <span>{quantity}</span>

          <button onClick={increaseQuantity}>
            +
          </button>
        </div>
      </div>

      <button
        className={styles.addButton}
        onClick={handleAddToCart}
      >
        Adicionar ao carrinho
      </button>
    </>
  );
}