import { Link, NavLink } from "react-router-dom";
import monogram from "../assets/fs-monogram.png";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <img src={monogram} alt="Faty Store" className="logo-mark" />
          <span className="logo-text">
            <strong>Faty Store</strong>
            <em>Beauty &amp; Co</em>
          </span>
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
