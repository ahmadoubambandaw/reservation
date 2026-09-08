import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Faty <span>Store</span>
          <small>Beauty &amp; Co</small>
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/catalogue">Catalogue</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <Link to="/panier" className="cart-link">
          Panier
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
      </div>
    </header>
  );
}
