"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import styles from "./BrandCarousel.module.css";
import morenaLogo from "@/assets/logo-morena.png";
import bressanLogo from "@/assets/bressan-logo.png";
import pumaLogo from "@/assets/puma-logo.png";

type Brand = {
  name: string;
  image: StaticImageData;
};

const brands: Brand[] = [
  { name: "Morena", image: morenaLogo },
  { name: "Bressan", image: bressanLogo },
  { name: "Puma", image: pumaLogo },
];

export default function BrandCarousel() {
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = () => setIsPaused((paused) => !paused);

  const renderBrands = (duplicate = false) => (
    <div className={styles.track} aria-hidden={duplicate}>
      {brands.map((brand) => (
        <button
          type="button"
          key={`${brand.name}-${duplicate ? "duplicate" : "original"}`}
          className={styles.brand}
          onClick={togglePause}
          aria-label={`${brand.name}. ${isPaused ? "Clique para continuar" : "Clique para pausar"} o carrossel`}
          title={`${brand.name} — ${isPaused ? "Clique para continuar" : "Clique para pausar"}`}
        >
          <Image src={brand.image} alt={brand.name} className={styles.logo} />
        </button>
      ))}
    </div>
  );

  return (
    <section className={styles.section} aria-label="Marcas parceiras">
      <div className={styles.header}>
        <span className={styles.line} />
        <div>
          <span className={styles.eyebrow}>NOSSAS MARCAS</span>
          <h2>Marcas que fazem parte da nossa coleção</h2>
        </div>
        <span className={styles.line} />
      </div>

      <div className={`${styles.carousel} ${isPaused ? styles.paused : ""}`}>
        <div className={styles.viewport}>
          <div className={styles.trackGroup}>
            {renderBrands()}
            {renderBrands(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
