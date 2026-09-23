import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";

export default function ProductCarousel({ products, interval = 4000 }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  function scrollByCard(direction) {
    const track = trackRef.current;
    if (!track) return;
    const items = track.children;
    const step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = track.scrollLeft <= 4;

    if (direction > 0 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction < 0 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (paused || products.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => scrollByCard(1), interval);
    return () => clearInterval(timer);
  }, [paused, products.length, interval]);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <button
        className="carousel-arrow prev"
        onClick={() => scrollByCard(-1)}
        aria-label="Produits précédents"
      >
        ‹
      </button>
      <div className="carousel-track" ref={trackRef}>
        {products.map((product) => (
          <div className="carousel-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        className="carousel-arrow next"
        onClick={() => scrollByCard(1)}
        aria-label="Produits suivants"
      >
        ›
      </button>
    </div>
  );
}
