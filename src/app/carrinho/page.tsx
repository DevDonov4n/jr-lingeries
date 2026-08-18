"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function Carrinho() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
    } = useCart();

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Carrinho vazio
  if (cart.length === 0) {
    return (
      <main className={styles.main}>
        <section className={styles.empty}>
          <div className={styles.emptyIcon}>
            🛍️
          </div>

          <h1>Seu carrinho está vazio</h1>

          <p>
            Você ainda não adicionou nenhum produto.
          </p>

          <Link
            href="/produtos"
            className={styles.continueButton}
          >
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
          {cart.reduce(
            (total, item) => total + item.quantity,
            0
          )}{" "}
          item(ns)
        </span>
      </div>

      <section className={styles.content}>

        {/* PRODUTOS */}
        <div className={styles.products}>

          {cart.map((item) => (
            <article
              key={`${item.id}-${item.selectedSize}`}
              className={styles.item}
            >

              <div className={styles.image}>
                Imagem
              </div>

              <div className={styles.info}>

                <h2>{item.name}</h2>

                <p className={styles.category}>
                  {item.category}
                </p>

                <p>
                  Tamanho:{" "}
                  <strong>
                    {item.selectedSize}
                  </strong>
                </p>

                <p className={styles.price}>
                  R${" "}
                  {item.price
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

                <div className={styles.quantity}>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

              </div>

              <button
                className={styles.remove}
                onClick={() =>
                  removeFromCart(
                    item.id,
                    item.selectedSize
                  )
                }
              >
                Remover
              </button>

            </article>
          ))}

          <button
            className={styles.clear}
            onClick={clearCart}
          >
            Limpar carrinho
          </button>

        </div>

        {/* RESUMO */}
        <aside className={styles.summary}>

          <h2>Resumo do pedido</h2>

          <div className={styles.line}>
            <span>Subtotal</span>

            <strong>
              R${" "}
              {total
                .toFixed(2)
                .replace(".", ",")}
            </strong>
          </div>

          <div className={styles.line}>
            <span>Frete</span>

            <span>
              A calcular
            </span>
          </div>

          <hr />

          <div className={styles.total}>
            <span>Total</span>

            <strong>
              R${" "}
              {total
                .toFixed(2)
                .replace(".", ",")}
            </strong>
          </div>

          <button className={styles.checkout}>
            Finalizar compra
          </button>

          <Link
            href="/produtos"
            className={styles.continue}
          >
            Continuar comprando
          </Link>

        </aside>

      </section>
    </main>
  );
}