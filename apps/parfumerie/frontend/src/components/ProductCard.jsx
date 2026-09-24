import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { formatPrice } from "../format.js";
import { productOrderMessage, whatsappLink } from "../whatsapp.js";
import { HeartIcon, StarIcon, WhatsAppIcon } from "./Icons.jsx";

export { formatPrice };

// Note factice déterministe (même logique que les avis d'exemple de la fiche produit),
// en attendant un vrai système d'avis client.
function pseudoRating(id) {
  const sum = String(id)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 4 + (sum % 11) / 10;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [added, setAdded] = useState(false);
  const favorite = isFavorite(product.id);
  const rating = pseudoRating(product.id);

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function handleWhatsAppOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    // Le bouton est dans un lien (<a>) : on ouvre WhatsApp par script plutôt qu'avec un <a> imbriqué.
    window.open(whatsappLink(productOrderMessage(product)), "_blank", "noopener");
  }

  function handleToggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
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
        <button
          className={`wishlist-btn${favorite ? " active" : ""}`}
          onClick={handleToggleFavorite}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <HeartIcon size={16} filled={favorite} />
        </button>
        {product.stock > 0 && (
          <div className="card-actions">
            <button
              className="quick-whatsapp"
              onClick={handleWhatsAppOrder}
              aria-label="Commander sur WhatsApp"
              title="Commander sur WhatsApp"
            >
              <WhatsAppIcon size={17} />
            </button>
            <button
              className="quick-add"
              onClick={handleQuickAdd}
              aria-label="Ajouter au panier"
              title="Ajouter au panier"
            >
              {added ? "✓" : "+"}
            </button>
          </div>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <div className="card-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} size={12} filled={n <= Math.round(rating)} />
          ))}
          <span>{rating.toFixed(1)}</span>
        </div>
        <p className="product-meta">
          {product.category}
          {product.volume_ml > 0 ? ` · ${product.volume_ml} ml` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price_xof)}</p>
      </div>
    </Link>
  );
}
