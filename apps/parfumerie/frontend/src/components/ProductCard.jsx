import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export function formatPrice(xof) {
  return `${Math.round(xof).toLocaleString("fr-FR")} FCFA`;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Link to={`/produit/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.stock === 0 ? (
          <span className="badge-outofstock">Épuisé</span>
        ) : (
          product.featured && <span className="badge-new">Nouveau</span>
        )}
        {product.stock > 0 && (
          <button
            className="quick-add"
            onClick={handleQuickAdd}
            aria-label="Ajouter au panier"
            title="Ajouter au panier"
          >
            {added ? "✓" : "+"}
          </button>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <p className="product-meta">
          {product.category}
          {product.volume_ml > 0 ? ` · ${product.volume_ml} ml` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price_xof)}</p>
      </div>
    </Link>
  );
}
