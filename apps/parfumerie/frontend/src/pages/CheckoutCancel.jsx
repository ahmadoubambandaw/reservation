import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="container checkout-result">
      <h1>Paiement annulé</h1>
      <p>Votre commande n'a pas été finalisée. Votre panier a été conservé.</p>
      <Link to="/panier" className="btn btn-primary">
        Retour au panier
      </Link>
    </div>
  );
}
