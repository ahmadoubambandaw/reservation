import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import { SearchIcon } from "../components/Icons.jsx";

const TYPES = [
  { value: "", label: "Tout" },
  { value: "Parfum", label: "Parfums" },
  { value: "Soin", label: "Soins" },
  { value: "Accessoire", label: "Accessoires" },
];

const GENDERS = [
  { value: "Femme", label: "Femme" },
  { value: "Homme", label: "Homme" },
  { value: "Mixte", label: "Unisexe" },
];

const PRICE_RANGES = [
  { label: "Moins de 30 000 FCFA", min: 0, max: 30000 },
  { label: "30 000 – 60 000 FCFA", min: 30000, max: 60000 },
  { label: "60 000 – 100 000 FCFA", min: 60000, max: 100000 },
  { label: "Plus de 100 000 FCFA", min: 100000, max: Infinity },
];

// Découpe une chaîne « Vanille & Patchouli » ou « Soirée, Cérémonie » en jetons uniques.
function tokenize(value) {
  return (value || "")
    .split(/[,&]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [gender, setGender] = useState(() => searchParams.get("gender") || "");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [note, setNote] = useState("");
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function selectType(nextType) {
    setCategory("");
    setSearchParams(nextType ? { type: nextType } : {});
  }

  useEffect(() => {
    setLoading(true);
    api
      .getProducts(type ? { type } : {})
      .then(setAllProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type]);

  // Toutes les valeurs de filtre sont calculées à partir des produits déjà chargés
  // pour le type courant, afin de ne jamais proposer une option qui ne donnerait aucun résultat.
  const categories = useMemo(() => uniqueSorted(allProducts.map((p) => p.category)), [allProducts]);
  const brands = useMemo(() => uniqueSorted(allProducts.map((p) => p.brand)), [allProducts]);
  const notes = useMemo(
    () =>
      uniqueSorted(
        allProducts.flatMap((p) => [...tokenize(p.top_note), ...tokenize(p.heart_note), ...tokenize(p.base_note)])
      ),
    [allProducts]
  );
  const occasions = useMemo(
    () => uniqueSorted(allProducts.flatMap((p) => tokenize(p.occasion))),
    [allProducts]
  );
  const seasons = useMemo(
    () => uniqueSorted(allProducts.flatMap((p) => tokenize(p.season))),
    [allProducts]
  );
  const activeRange = PRICE_RANGES.find((r) => r.label === priceRange);
  const searchTerm = search.trim().toLowerCase();

  const visibleProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (category && p.category !== category) return false;
      if (gender && p.gender !== gender) return false;
      if (brand && p.brand !== brand) return false;
      if (activeRange && (p.price_xof < activeRange.min || p.price_xof > activeRange.max)) return false;
      if (note && ![...tokenize(p.top_note), ...tokenize(p.heart_note), ...tokenize(p.base_note)].includes(note))
        return false;
      if (occasion && !tokenize(p.occasion).includes(occasion)) return false;
      if (season && !tokenize(p.season).includes(season)) return false;
      if (searchTerm && !`${p.name} ${p.brand}`.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
  }, [allProducts, category, gender, brand, activeRange, note, occasion, season, searchTerm]);

  const activeFilterCount = [category, gender, brand, priceRange, note, occasion, season].filter(
    Boolean
  ).length;

  function resetFilters() {
    setCategory("");
    setGender("");
    setBrand("");
    setPriceRange("");
    setNote("");
    setOccasion("");
    setSeason("");
  }

  function FilterGroup({ title, options, value, onChange }) {
    if (options.length === 0) return null;
    return (
      <div className="filter-group">
        <p className="filter-group-title">{title}</p>
        <div className="filter-pills">
          {options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <button
                key={optValue}
                className={value === optValue ? "active" : ""}
                onClick={() => onChange(value === optValue ? "" : optValue)}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Notre catalogue</h1>

      <div className="catalog-search-bar">
        <SearchIcon size={18} />
        <input
          type="search"
          className="catalog-search"
          placeholder="🔍 Rechercher un parfum…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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

      <button
        type="button"
        className="filters-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
      >
        Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        <span className={`filters-toggle-arrow${filtersOpen ? " open" : ""}`}>▾</span>
      </button>

      <div className="catalog-layout">
        <aside className={`catalog-filters${filtersOpen ? " open" : ""}`}>
          <div className="filters-head">
            <p className="filter-group-title">Filtres intelligents</p>
            {activeFilterCount > 0 && (
              <button type="button" className="link-button" onClick={resetFilters}>
                Réinitialiser
              </button>
            )}
          </div>

          <FilterGroup title="Prix" options={PRICE_RANGES.map((r) => r.label)} value={priceRange} onChange={setPriceRange} />
          <FilterGroup title="Genre" options={GENDERS} value={gender} onChange={setGender} />
          <FilterGroup title="Marque" options={brands} value={brand} onChange={setBrand} />
          <FilterGroup
            title={type === "Parfum" ? "Famille olfactive" : "Catégorie"}
            options={categories}
            value={category}
            onChange={setCategory}
          />
          <FilterGroup title="Notes" options={notes} value={note} onChange={setNote} />
          <FilterGroup title="Occasion" options={occasions} value={occasion} onChange={setOccasion} />
          <FilterGroup title="Saison" options={seasons} value={season} onChange={setSeason} />
        </aside>

        <div className="catalog-results">
          {error && <p className="error-text">{error}</p>}
          {loading ? (
            <p>Chargement…</p>
          ) : visibleProducts.length === 0 ? (
            <p>Aucun produit ne correspond à ces critères.</p>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
