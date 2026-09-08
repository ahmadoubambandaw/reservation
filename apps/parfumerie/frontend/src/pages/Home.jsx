import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import heroPhoto from "../assets/hero.jpg";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = [
  {
    icon: "🧴",
    title: "Parfums d'exception",
    description: "Des senteurs uniques pour chaque occasion.",
  },
  {
    icon: "🫙",
    title: "Soins Premium",
    description: "Prenez soin de vous avec des produits de qualité.",
  },
  {
    icon: "👜",
    title: "Accessoires Chic",
    description: "L'élégance se complète dans les détails.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getProducts({ featured: "true" })
      .then(setFeatured)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              L'élégance <span>à portée de main</span>
            </h1>
            <p>
              Découvrez une sélection raffinée de parfums, soins et accessoires pour révéler
              votre beauté au quotidien.
            </p>
            <Link to="/catalogue" className="btn btn-primary">
              Découvrir la collection
            </Link>

            <div className="hero-categories">
              {CATEGORIES.map((cat) => (
                <div className="hero-category" key={cat.title}>
                  <span className="hero-category-icon">{cat.icon}</span>
                  <div>
                    <h3>{cat.title}</h3>
                    <p>{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-photo">
            <img src={heroPhoto} alt="Faty Store — Beauty & Co" />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="section-title">Nos coups de cœur</h2>
        {error && <p className="error-text">{error}</p>}
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
