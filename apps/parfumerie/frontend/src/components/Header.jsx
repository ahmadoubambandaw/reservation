import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { BagIcon, HeartIcon, UserIcon } from "./Icons.jsx";

const monogram =
  "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/fs-monogram.png";

export default function Header() {
  const { totalItems } = useCart();
  const { productIds } = useWishlist();

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
          <NavLink to="/catalogue">Boutique</NavLink>
          <NavLink to="/catalogue?type=Parfum">Parfums</NavLink>
          <NavLink to="/catalogue?type=Soin">Soins</NavLink>
          <NavLink to="/catalogue?type=Accessoire">Accessoires</NavLink>
        </nav>
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
    </header>
  );
}
