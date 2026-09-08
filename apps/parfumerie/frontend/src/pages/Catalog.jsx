import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

const TYPES = [
  { value: "", label: "Tout" },
  { value: "Parfum", label: "Parfums" },
  { value: "Soin", label: "Soins" },
  { value: "Accessoire", label: "Accessoires" },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [gender, setGender] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function selectType(nextType) {
    setCategory("");
    setSearchParams(nextType ? { type: nextType } : {});
  }

  useEffect(() => {
    api
      .getCategories(type ? { type } : {})
      .then(setCategories)
      .catch(() => {});
  }, [type]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (type) params.type = type;
    if (category) params.category = category;
    if (gender) params.gender = gender;

    api
      .getProducts(params)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, category, gender]);

  return (
    <div className="container">
      <h1 className="page-title">Notre catalogue</h1>

      <div className="type-tabs">
        {TYPES.map((t) => (
          <button
            key={t.value}
            className={type === t.value ? "active" : ""}
            onClick={() => selectType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Tous les genres</option>
          <option value="Femme">Femme</option>
          <option value="Homme">Homme</option>
          <option value="Mixte">Mixte</option>
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : products.length === 0 ? (
        <p>Aucun produit ne correspond à ces critères.</p>
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
