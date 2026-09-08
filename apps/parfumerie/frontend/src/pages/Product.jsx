import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { formatPrice } from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setAdded(false);
    api
      .getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container"><p className="error-text">{error}</p></div>;
  if (!product) return <div className="container"><p>Chargement…</p></div>;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
  }

  return (
    <div className="container product-detail">
      <div className="product-detail-image">
        <img src={product.image_url} alt={product.name} />
      </div>
      <div className="product-detail-info">
        <button className="link-button" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <p className="product-brand">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="product-meta">
          {product.category} · {product.gender}
          {product.volume_ml > 0 ? ` · ${product.volume_ml} ml` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price_cents)}</p>
        <p className="product-description">{product.description}</p>

        {product.stock > 0 ? (
          <>
            <p className="stock-info">{product.stock} en stock</p>
            <div className="add-to-cart">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                Ajouter au panier
              </button>
            </div>
            {added && <p className="success-text">Ajouté au panier !</p>}
          </>
        ) : (
          <p className="error-text">Ce produit est actuellement épuisé.</p>
        )}
      </div>
    </div>
  );
}
