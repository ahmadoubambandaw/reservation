import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { formatPrice } from "../format.js";
import { productOrderMessage, whatsappLink } from "../whatsapp.js";
import { HeartIcon, WhatsAppIcon } from "./Icons.jsx";

export { formatPrice };

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [added, setAdded] = useState(false);
  const favorite = isFavorite(product.id);

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
        <p className="product-meta">
          {product.category}
          {product.volume_ml > 0 ? ` · ${product.volume_ml} ml` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price_xof)}</p>
      </div>
    </Link>
  );
}
