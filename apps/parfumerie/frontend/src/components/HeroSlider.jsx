import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroSlider({ slides, interval = 5500 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2 || prefersReducedMotion()) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(timer);
  }, [paused, slides.length, interval]);

  function go(direction) {
    setIndex((i) => (i + direction + slides.length) % slides.length);
  }

  const slide = slides[index];

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={s.alt}
          className={`hero-bg${i === index ? " active" : ""}`}
          aria-hidden={i !== index}
        />
      ))}
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-inner">
        {/* La clé force le remontage pour rejouer l'animation d'entrée à chaque slide. */}
        <div className="hero-text" key={index}>
          <span className="hero-kicker">{slide.kicker}</span>
          <h1>
            {slide.title} <em>{slide.highlight}</em>
          </h1>
          <p>{slide.text}</p>
          <Link to={slide.cta.to} className="btn btn-primary">
            {slide.cta.label}
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-arrow prev" onClick={() => go(-1)} aria-label="Diapositive précédente">
            ‹
          </button>
          <button className="hero-arrow next" onClick={() => go(1)} aria-label="Diapositive suivante">
            ›
          </button>
        </>
      )}

      <div className="hero-dots glass">
        {slides.map((s, i) => (
          <button
            key={i}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Afficher la diapositive ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
