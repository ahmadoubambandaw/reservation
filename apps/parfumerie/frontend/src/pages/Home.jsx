import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

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
          <h1>L'art du parfum, sublimé</h1>
          <p>
            Découvrez des fragrances rares et raffinées, créées pour révéler votre signature
            olfactive.
          </p>
          <Link to="/catalogue" className="btn btn-primary">
            Découvrir la collection
          </Link>
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

      <section className="promise container">
        <div className="promise-item">
          <h3>Sélection exigeante</h3>
          <p>Des parfums composés avec des matières premières de grande qualité.</p>
        </div>
        <div className="promise-item">
          <h3>Livraison soignée</h3>
          <p>Chaque commande est emballée avec soin et expédiée rapidement.</p>
        </div>
        <div className="promise-item">
          <h3>Paiement sécurisé</h3>
          <p>Transactions protégées grâce à Stripe.</p>
        </div>
      </section>
    </div>
  );
}
