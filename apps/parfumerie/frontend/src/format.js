export function formatPrice(xof) {
  return `${Math.round(xof).toLocaleString("fr-FR")} FCFA`;
}
