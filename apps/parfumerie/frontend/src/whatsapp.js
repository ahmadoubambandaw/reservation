import { formatPrice } from "./format.js";

// Numéro WhatsApp de la boutique au format international (Sénégal : 221).
export const WHATSAPP_NUMBER = "221761796858";

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function productUrl(product) {
  return `${window.location.origin}/produit/${product.id}`;
}

export function productOrderMessage(product, quantity = 1) {
  return [
    "Bonjour Faty Store 👋",
    "Je souhaite commander :",
    `• ${product.name} (${product.brand}) × ${quantity} — ${formatPrice(product.price_xof * quantity)}`,
    productUrl(product),
    "",
    "Merci de me confirmer la disponibilité et la livraison.",
  ].join("\n");
}

export function productAvailabilityMessage(product) {
  return [
    "Bonjour Faty Store 👋",
    `Le produit « ${product.name} » (${product.brand}) sera-t-il bientôt de nouveau disponible ?`,
    productUrl(product),
  ].join("\n");
}

export function cartOrderMessage(items, totalXof) {
  return [
    "Bonjour Faty Store 👋",
    "Je souhaite commander :",
    ...items.map(
      ({ product, quantity }) =>
        `• ${product.name} × ${quantity} — ${formatPrice(product.price_xof * quantity)}`
    ),
    "",
    `Total : ${formatPrice(totalXof)}`,
    "Merci de me confirmer la disponibilité et la livraison.",
  ].join("\n");
}

export const GENERAL_MESSAGE =
  "Bonjour Faty Store 👋 Je souhaite passer une commande / avoir un conseil.";
