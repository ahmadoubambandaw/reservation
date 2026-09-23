import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function Favorites() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getProducts({})
      .then((all) => setProducts(all.filter((p) => productIds.includes(p.id))))
      .finally(() => setLoading(false));
  }, [productIds]);

  return (
    <div className="container">
      <h1 className="page-title">Mes favoris</h1>

      {loading ? (
        <p>Chargement…</p>
      ) : products.length === 0 ? (
        <div className="favorites-empty">
          <p>Vous n'avez pas encore de favoris.</p>
          <Link to="/catalogue" className="btn btn-primary">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
