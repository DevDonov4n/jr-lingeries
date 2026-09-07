import Image from "next/image";
import styles from "./page.module.css";

export default function SobrePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>SOBRE A JR LINGERIES</span>
          <h1>Delicadeza que valoriza <em>você.</em></h1>
          <p>
            A JR Lingeries nasceu para oferecer peças que unem beleza, conforto
            e delicadeza em cada detalhe. Nosso propósito é fazer com que cada
            mulher se sinta ainda mais confiante e especial.
          </p>
        </div>
        <div className={styles.visual}>
          <Image
            src="/assets/ConjuntoRomance.jpg"
            alt="Peça da coleção JR Lingeries"
            fill
            className={styles.image}
            priority
          />
        </div>
      </section>

      <section className={styles.story}>
        <div>
          <span className={styles.eyebrow}>NOSSA ESSÊNCIA</span>
          <h2>Mais do que lingerie, uma experiência.</h2>
        </div>
        <div className={styles.text}>
          <p>
            Selecionamos cada peça pensando em diferentes momentos, estilos e
            personalidades. Acreditamos que conforto e autoestima caminham
            juntos, por isso buscamos produtos que façam sentido para a rotina
            e também para aqueles momentos especiais.
          </p>
          <p>
            Na JR Lingeries, cada detalhe importa: da escolha das peças ao
            atendimento. Queremos construir uma relação próxima com nossas
            clientes, oferecendo carinho, praticidade e uma experiência de
            compra leve e acolhedora.
          </p>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.card}><span>01</span><h3>Conforto</h3><p>Peças pensadas para acompanhar você com leveza.</p></div>
        <div className={styles.card}><span>02</span><h3>Delicadeza</h3><p>Detalhes que traduzem feminilidade e cuidado.</p></div>
        <div className={styles.card}><span>03</span><h3>Confiança</h3><p>Porque se sentir bem com você mesma faz toda diferença.</p></div>
      </section>
    </main>
  );
}
