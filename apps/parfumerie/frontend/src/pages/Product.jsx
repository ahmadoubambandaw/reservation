import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { formatPrice } from "../components/ProductCard.jsx";
import { HeartIcon, StarIcon } from "../components/Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

const SAMPLE_REVIEWS = [
  {
    author: "Aïssatou D.",
    rating: 5,
    text: "Un parfum sublime, tient toute la journée. Livraison rapide en plus !",
  },
  {
    author: "Fatou S.",
    rating: 5,
    text: "Exactement comme sur les photos, très bonne qualité. Je recommande.",
  },
  {
    author: "Mariama B.",
    rating: 4,
    text: "Très joli flacon et une odeur agréable, un vrai coup de cœur.",
  },
];

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
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

  const favorite = isFavorite(product.id);
  const averageRating =
    SAMPLE_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / SAMPLE_REVIEWS.length;

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
        <div className="product-detail-heading">
          <div>
            <p className="product-brand">{product.brand}</p>
            <h1>{product.name}</h1>
          </div>
          <button
            className={`wishlist-btn large${favorite ? " active" : ""}`}
            onClick={() => toggleFavorite(product.id)}
            aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <HeartIcon size={20} filled={favorite} />
          </button>
        </div>
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} size={15} filled={n <= Math.round(averageRating)} />
          ))}
          <span>
            {averageRating.toFixed(1)} ({SAMPLE_REVIEWS.length} avis)
          </span>
        </div>
        <p className="product-meta">
          {product.category} · {product.gender}
          {product.volume_ml > 0 ? ` · ${product.volume_ml} ml` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price_xof)}</p>
        <p className="product-description">{product.description}</p>

        {(product.top_note || product.heart_note || product.base_note) && (
          <div className="fragrance-notes">
            {product.top_note && (
              <div className="fragrance-note">
                <span className="fragrance-note-circle">Tête</span>
                <p>{product.top_note}</p>
              </div>
            )}
            {product.heart_note && (
              <div className="fragrance-note">
                <span className="fragrance-note-circle">Cœur</span>
                <p>{product.heart_note}</p>
              </div>
            )}
            {product.base_note && (
              <div className="fragrance-note">
                <span className="fragrance-note-circle">Fond</span>
                <p>{product.base_note}</p>
              </div>
            )}
          </div>
        )}

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

        <div className="product-reviews">
          <h2>Avis clients</h2>
          {SAMPLE_REVIEWS.map((review) => (
            <div className="review-card" key={review.author}>
              <div className="review-card-head">
                <strong>{review.author}</strong>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} size={13} filled={n <= review.rating} />
                  ))}
                </div>
              </div>
              <p>{review.text}</p>
            </div>
          ))}
          <p className="testimonial-note">Exemples d'avis — à remplacer par vos vrais avis clients.</p>
        </div>
      </div>
    </div>
  );
}
