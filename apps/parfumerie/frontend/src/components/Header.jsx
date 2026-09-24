import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "./Icons.jsx";

const monogram =
  "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/main/apps/parfumerie/frontend/src/assets/fs-monogram.png";

export default function Header() {
  const { totalItems } = useCart();
  const { productIds } = useWishlist();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(search.trim() ? `/catalogue?search=${encodeURIComponent(search.trim())}` : "/catalogue");
  }

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-top">
        <form className="header-search" onSubmit={handleSearchSubmit} role="search">
          <SearchIcon size={16} />
          <input
            type="search"
            placeholder="Rechercher des produits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher des produits"
          />
        </form>

        <Link to="/" className="logo">
          <img src={monogram} alt="Faty Store" className="logo-mark" />
          <span className="logo-text">
            <strong>Faty Store</strong>
            <em>Beauty &amp; Co</em>
          </span>
        </Link>

        <div className="header-icons">
          <Link to="/admin" className="icon-link" title="Espace administration" aria-label="Administration">
            <UserIcon size={20} />
          </Link>
          <Link to="/favoris" className="cart-link" aria-label="Favoris">
            <HeartIcon size={20} />
            {productIds.length > 0 && <span className="cart-badge">{productIds.length}</span>}
          </Link>
          <Link to="/panier" className="cart-link" aria-label="Panier">
            <BagIcon size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>

      <nav className="main-nav container">
        <NavLink to="/" end>
          Accueil
        </NavLink>
        <NavLink to="/catalogue">Boutique</NavLink>
        <NavLink to="/catalogue?type=Parfum">Parfums</NavLink>
        <NavLink to="/catalogue?type=Soin">Soins</NavLink>
        <NavLink to="/catalogue?type=Accessoire">Accessoires</NavLink>
      </nav>
    </header>
  );
}
