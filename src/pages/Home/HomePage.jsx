import { useEffect, useState } from "react";

import logoHorizontal from "../../assets/Captura de tela 2026-04-14 121940.png";
import fiocruzBuilding from "../../assets/fiocruz_brasilia.png";
import logoFiocruzBrasiliaHorizontal from "../../assets/H1.png";
import logoFiocruzBrasiliaVertical from "../../assets/V2.png";
import logoFiocruz from "../../assets/download.png";

const carouselImages = [
  { src: fiocruzBuilding, alt: "Prédio da Fiocruz Brasília" },
  { src: logoFiocruzBrasiliaHorizontal, alt: "Marca Fiocruz Brasília horizontal" },
  { src: logoFiocruzBrasiliaVertical, alt: "Marca Fiocruz Brasília vertical" },
  { src: logoFiocruz, alt: "Marca Fiocruz" },
  { src: logoHorizontal, alt: "Marca Fiocruz Brasília" },
];

export function HomePage({
  onAdmin,
  onConsult,
  onForm,
  storageMode,
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (carouselImages.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselImages.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="landing-card launchpad-card">
      <div className="premium-hero launchpad-hero">
        <div className="hero-copy">
          <span className="badge">NUGB</span>
          <h2>Solicitação de passagens e diárias</h2>
          <p>
            Registre uma viagem institucional e acompanhe o fluxo pelo painel
            administrativo.
          </p>
          <div className="home-buttons choice-buttons">
            <button className="btn btn-admin" type="button" onClick={onForm}>
              Nova solicitação
            </button>
            <button className="btn btn-secondary" type="button" onClick={onConsult}>
              Consultar solicitações
            </button>
            <button className="btn btn-secondary" type="button" onClick={onAdmin}>
              Painel admin
            </button>
          </div>
          <div className="hero-inline-status">
            <span />
            {storageMode}
          </div>
        </div>
        <div className="home-carousel" aria-label="Imagens institucionais">
          <div
            className="home-carousel-track"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {carouselImages.map((image) => (
              <figure className="home-carousel-slide" key={image.src}>
                <img src={image.src} alt={image.alt} />
              </figure>
            ))}
          </div>
          <div className="home-carousel-dots">
            {carouselImages.map((image, index) => (
              <button
                aria-label={`Mostrar imagem ${index + 1}`}
                className={activeSlide === index ? "active" : ""}
                key={image.src}
                type="button"
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
