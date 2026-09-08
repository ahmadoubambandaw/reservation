import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { formatPrice } from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await api.createCheckoutSession(
        items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      );
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">Votre panier</h1>
        <p>Votre panier est vide.</p>
        <Link to="/catalogue" className="btn btn-primary">
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Votre panier</h1>

      <div className="cart-list">
        {items.map(({ product, quantity }) => (
          <div className="cart-row" key={product.id}>
            <img src={product.image_url} alt={product.name} />
            <div className="cart-row-info">
              <p className="product-brand">{product.brand}</p>
              <h3>{product.name}</h3>
              <p className="product-price">{formatPrice(product.price_cents)}</p>
            </div>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
            />
            <p className="cart-row-subtotal">{formatPrice(product.price_cents * quantity)}</p>
            <button className="link-button" onClick={() => removeItem(product.id)}>
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <p>
          Total : <strong>{formatPrice(totalCents)}</strong>
        </p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
          {loading ? "Redirection vers le paiement…" : "Passer au paiement"}
        </button>
      </div>
    </div>
  );
}
