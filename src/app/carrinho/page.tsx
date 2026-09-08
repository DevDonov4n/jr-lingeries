"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

function money(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function Carrinho() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <main className={styles.main}>
        <section className={styles.empty}>
          <h1>Carregando seu carrinho...</h1>
        </section>
      </main>
    );
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.originalPrice ?? item.price) * item.quantity,
    0
  );

  const discount = cart.reduce(
    (acc, item) => acc + (item.discountAmount ?? 0) * item.quantity,
    0
  );

  const total = subtotal - discount;

  if (cart.length === 0) {
    return (
      <main className={styles.main}>
        <section className={styles.empty}>
          <div className={styles.emptyIcon}>🛍️</div>
          <h1>Seu carrinho está vazio</h1>
          <p>Você ainda não adicionou nenhum produto.</p>
          <Link href="/produtos" className={styles.continueButton}>
            Ver produtos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <p>JR Lingeries</p>
        <h1>Meu carrinho</h1>
        <span>
          {cart.reduce((count, item) => count + item.quantity, 0)} item(ns)
        </span>
      </div>

      <section className={styles.content}>
        <div className={styles.products}>
          {cart.map((item) => {
            const hasDiscount = (item.discountAmount ?? 0) > 0;
            const itemOriginalTotal = (item.originalPrice ?? item.price) * item.quantity;
            const itemDiscountTotal = (item.discountAmount ?? 0) * item.quantity;

            return (
              <article
                key={`${item.id}-${item.selectedSize}`}
                className={styles.item}
              >
                <div className={styles.image}>Imagem</div>

                <div className={styles.info}>
                  <h2>{item.name}</h2>
                  <p className={styles.category}>{item.category}</p>

                  <p>
                    Tamanho: <strong>{item.selectedSize}</strong>
                  </p>

                  {hasDiscount ? (
                    <div className={styles.priceBox}>
                      <span className={styles.originalPrice}>
                        {money(item.originalPrice ?? item.price)}
                      </span>
                      <p className={styles.price}>
                        {money(item.price)}
                      </p>
                      <span className={styles.offer}>
                        🏷️ {item.offerName ?? `${Math.round(item.discountPercent ?? 0)}% OFF`}
                      </span>
                      <span className={styles.itemDiscount}>
                        Você economiza {money(itemDiscountTotal)}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.price}>{money(item.price)}</p>
                  )}

                  <div className={styles.quantity}>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.selectedSize, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.selectedSize, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  {hasDiscount && (
                    <p className={styles.itemTotal}>
                      Total do item: <strong>{money(itemOriginalTotal - itemDiscountTotal)}</strong>
                    </p>
                  )}
                </div>

                <button
                  className={styles.remove}
                  onClick={() => removeFromCart(item.id, item.selectedSize)}
                >
                  Remover
                </button>
              </article>
            );
          })}

          <button className={styles.clear} onClick={clearCart}>
            Limpar carrinho
          </button>
        </div>

        <aside className={styles.summary}>
          <h2>Resumo do pedido</h2>

          <div className={styles.line}>
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>

          {discount > 0 && (
            <div className={`${styles.line} ${styles.discountLine}`}>
              <span>Desconto</span>
              <strong>- {money(discount)}</strong>
            </div>
          )}

          <div className={styles.line}>
            <span>Frete</span>
            <span>A calcular</span>
          </div>

          <hr />

          <div className={styles.total}>
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          {discount > 0 && (
            <p className={styles.savings}>
              🎉 Você economizou {money(discount)} neste pedido!
            </p>
          )}

          <button className={styles.checkout}>Finalizar compra</button>

          <Link href="/produtos" className={styles.continue}>
            Continuar comprando
          </Link>
        </aside>
      </section>
    </main>
  );
}
