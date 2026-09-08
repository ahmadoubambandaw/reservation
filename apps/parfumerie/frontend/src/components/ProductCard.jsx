import { Link } from "react-router-dom";

export function formatPrice(cents) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function ProductCard({ product }) {
  return (
    <Link to={`/produit/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.stock === 0 && <span className="badge-outofstock">Épuisé</span>}
      </div>
      <div className="product-card-body">
        <p className="product-brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <p className="product-meta">
          {product.category} · {product.volume_ml} ml
        </p>
        <p className="product-price">{formatPrice(product.price_cents)}</p>
      </div>
    </Link>
  );
}
