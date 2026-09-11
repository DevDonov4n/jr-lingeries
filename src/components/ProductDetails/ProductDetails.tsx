"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import styles from "./ProductDetails.module.css";

interface ProductDetailsProps { product: Product; }

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const availableColors = product.colors.filter((color) => color.active && color.stock > 0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(availableColors[0]?.color ?? product.color ?? "");
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = product.colors.find((color) => color.color === selectedColor);
  const selectedStock = selectedVariant ? selectedVariant.stock : product.stock;

  function handleAddToCart() {
    if (selectedStock <= 0) return;
    addToCart(product, selectedSize, quantity, selectedColor);
    alert("Produto adicionado ao carrinho!");
  }
  function increaseQuantity() { if (quantity < selectedStock) setQuantity(quantity + 1); }
  function decreaseQuantity() { if (quantity > 1) setQuantity(quantity - 1); }
  function changeColor(color: string) { setSelectedColor(color); setQuantity(1); }

  return <>
    {product.colors.length > 0 && <div className={styles.option}><h2>Cor: <span>{selectedColor || "Selecione"}</span></h2><div className={styles.colors}>{product.colors.map((variant) => { const available = variant.active && variant.stock > 0; return <button key={variant.color} type="button" title={available ? variant.color : `${variant.color} - Esgotada`} aria-label={available ? variant.color : `${variant.color} - Esgotada`} aria-pressed={selectedColor === variant.color} disabled={!available} onClick={() => changeColor(variant.color)} className={`${styles.colorButton} ${selectedColor === variant.color ? styles.selectedColor : ""} ${!available ? styles.unavailableColor : ""}`}><span className={styles.colorDot} style={{ backgroundColor: variant.color.toLowerCase() }} />{!available && <span className={styles.unavailableMark}>×</span>}</button>; })}</div></div>}
    <div className={styles.option}><h2>Tamanho</h2><div className={styles.sizes}>{product.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} className={selectedSize === size ? styles.selected : ""}>{size}</button>)}</div></div>
    <div className={styles.option}><h2>Quantidade</h2><div className={styles.quantity}><button type="button" onClick={decreaseQuantity}>-</button><span>{quantity}</span><button type="button" onClick={increaseQuantity}>+</button></div></div>
    <button className={styles.addButton} onClick={handleAddToCart} disabled={selectedStock <= 0}>{selectedStock > 0 ? "Adicionar ao carrinho" : "Produto esgotado"}</button>
  </>;
}
