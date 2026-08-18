import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          JR Lingeries
        </h1>

        <p className={styles.description}>
          Beleza, conforto e delicadeza em cada detalhe.
        </p>

        <button className={styles.button}>
          Ver produtos
        </button>
      </section>
    </main>
  );
}