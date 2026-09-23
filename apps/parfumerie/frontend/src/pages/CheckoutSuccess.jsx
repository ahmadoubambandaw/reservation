import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    api
      .getCheckoutSession(orderId)
      .then((data) => {
        if (data.status === "paid") {
          clearCart();
          setStatus("paid");
        } else {
          setStatus("pending");
        }
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="container checkout-result">
      {status === "loading" && <p>Vérification du paiement…</p>}
      {status === "paid" && (
        <>
          <h1>Merci pour votre commande !</h1>
          <p>Votre paiement a bien été confirmé. Un e-mail de confirmation vous sera envoyé.</p>
        </>
      )}
      {status === "pending" && (
        <>
          <h1>Paiement en cours de traitement</h1>
          <p>Votre commande sera confirmée dès validation du paiement.</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1>Impossible de vérifier ce paiement</h1>
          <p>Si vous avez été débité, contactez-nous en indiquant votre référence de commande.</p>
        </>
      )}
      <Link to="/catalogue" className="btn btn-primary">
        Retour au catalogue
      </Link>
    </div>
  );
}
