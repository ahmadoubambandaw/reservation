export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} Essence de Luxe — Boutique de parfumerie</p>
        <p>Livraison partout en France · Paiement sécurisé par Stripe</p>
      </div>
    </footer>
  );
}
