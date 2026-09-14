"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";
import { Product } from "@/data/products";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  useEffect(() => {
    let active = true;

    async function loadFavorite() {
      try {
        const response = await fetch(`/api/favorites?productId=${product.id}`, { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated));
        setFavorite(Boolean(data.favorite));
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFavorite();
    return () => { active = false; };
  }, [product.id]);

  async function toggleFavorite() {
    if (loading) return;

    if (!authenticated) {
      window.location.href = "/login";
      return;
    }

    const previous = favorite;
    setFavorite(!previous);
    setHovering(false);

    try {
      const response = await fetch(`/api/favorites${previous ? `?productId=${product.id}` : ""}`, {
        method: previous ? "DELETE" : "POST",
        headers: previous ? undefined : { "Content-Type": "application/json" },
        body: previous ? undefined : JSON.stringify({ productId: product.id }),
      });

      if (!response.ok) throw new Error("Falha ao atualizar favorito");
      const data = await response.json();
      setFavorite(Boolean(data.favorite));
    } catch {
      setFavorite(previous);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={styles.category}>{product.category}</span>
        {hasDiscount && <span className={styles.discountBadge}>{Math.round(product.discountPercent ?? 0)}% OFF</span>}
        <button
          type="button"
          className={styles.favoriteButton}
          onClick={toggleFavorite}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {favorite ? (hovering ? <FaHeartBroken aria-hidden="true" /> : <FaHeart aria-hidden="true" />) : <FaRegHeart aria-hidden="true" />}
        </button>

        <Link href={`/produtos/${product.id}`} className={styles.imageLink}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 550px) 100vw, (max-width: 900px) 50vw, 25vw" className={styles.productImage} priority={product.id <= 2} />
        </Link>
      </div>

      <div className={styles.content}>
        <h2>{product.name}</h2>
        {hasDiscount ? (
          <div className={styles.priceBox}>
            <span className={styles.originalPrice}>R$ {product.originalPrice!.toFixed(2).replace(".", ",")}</span>
            <p className={styles.discountPrice}>R$ {product.price.toFixed(2).replace(".", ",")}</p>
            <span className={styles.offerName}>{product.offerName}</span>
          </div>
        ) : (
          <p className={styles.price}>R$ {product.price.toFixed(2).replace(".", ",")}</p>
        )}
        <p className={styles.stock}>{product.stock} unidades disponíveis</p>
        <Link href={`/produtos/${product.id}`} className={styles.button}>Ver produto</Link>
      </div>
    </article>
  );
}
