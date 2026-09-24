const MESSAGES = [
  "Livraison rapide partout à Dakar",
  "Retrait en boutique à Ouest Foire",
  "Paiement sécurisé via PayDunya",
  "Conseils personnalisés sur WhatsApp : 76 179 68 58",
];

// Deux copies identiques : l'animation défile de -50 % pour boucler sans saut.
const HALF = [...MESSAGES, ...MESSAGES];
const ITEMS = [...HALF, ...HALF];

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar marquee" role="region" aria-label="Informations de la boutique">
      <div className="marquee-track">
        {ITEMS.map((message, i) => (
          <span key={i} aria-hidden={i >= MESSAGES.length}>
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
