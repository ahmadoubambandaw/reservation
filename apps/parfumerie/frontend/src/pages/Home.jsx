import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import HeroSlider from "../components/HeroSlider.jsx";
import ProductCarousel from "../components/ProductCarousel.jsx";
import Reveal from "../components/Reveal.jsx";
import { GENERAL_MESSAGE, whatsappLink } from "../whatsapp.js";
import {
  BagIcon,
  ChatIcon,
  CitrusIcon,
  DropletIcon,
  FlowerIcon,
  GemIcon,
  HeartIcon,
  LockIcon,
  MailIcon,
  RocketIcon,
  ShieldIcon,
  SpaIcon,
  SparkleIcon,
  StarIcon,
  SunsetIcon,
  TreeIcon,
  TruckIcon,
  WhatsAppIcon,
} from "../components/Icons.jsx";

const ASSET_BASE =
  "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/main/apps/parfumerie/frontend/src/assets";

const tiktok2 = `${ASSET_BASE}/tiktok-2-violet-blossom.jpg`;
const tiktok1 = `${ASSET_BASE}/tiktok-1-ysl.jpg`;
const tiktok5 = `${ASSET_BASE}/tiktok-5-gold-trio.jpg`;
const tiktok6 = `${ASSET_BASE}/tiktok-6-vials.jpg`;

const HERO_SLIDES = [
  {
    image: `${ASSET_BASE}/hero.jpg`,
    alt: "Faty Store — Beauty & Co",
    kicker: "Faty Store · Beauty & Co",
    title: "Révélez votre",
    highlight: "éclat naturel",
    text: "Parfums, soins premium et accessoires chic pour révéler votre beauté au quotidien, sélectionnés avec exigence par Faty Store.",
    cta: { label: "Découvrir la boutique", to: "/catalogue" },
  },
  {
    image: `${ASSET_BASE}/tiktok-5-gold-trio.jpg`,
    alt: "Trio de parfums dorés",
    kicker: "Collection parfums",
    title: "Des parfums",
    highlight: "d'exception",
    text: "Des fragrances choisies avec exigence pour sublimer chaque moment de votre journée.",
    cta: { label: "Voir les parfums", to: "/catalogue?type=Parfum" },
  },
  {
    image: `${ASSET_BASE}/tiktok-1-ysl.jpg`,
    alt: "Flacon de parfum en boutique",
    kicker: "Nouveautés",
    title: "Les nouveautés",
    highlight: "du moment",
    text: "Découvrez les dernières arrivées en boutique : parfums, soins et accessoires chic.",
    cta: { label: "Voir les nouveautés", to: "/catalogue" },
  },
];

const SHOPPABLE_PHOTO_URLS = [
  `${ASSET_BASE}/tiktok-1-ysl.jpg`,
  `${ASSET_BASE}/tiktok-2-violet-blossom.jpg`,
  `${ASSET_BASE}/tiktok-3-hypnotic.jpg`,
  `${ASSET_BASE}/tiktok-4-my-way.jpg`,
  `${ASSET_BASE}/tiktok-5-gold-trio.jpg`,
  `${ASSET_BASE}/tiktok-6-vials.jpg`,
];

const COLLECTIONS = [
  {
    to: "/catalogue?gender=Femme",
    emoji: "🌹",
    title: "Féminin",
    description: "Des senteurs et soins pensés pour elle",
    image: tiktok2,
  },
  {
    to: "/catalogue?gender=Homme",
    emoji: "🖤",
    title: "Masculin",
    description: "Des signatures affirmées pour lui",
    image: tiktok1,
  },
  {
    to: "/catalogue?gender=Mixte",
    emoji: "✨",
    title: "Unisexe",
    description: "Des créations à partager sans distinction",
    image: tiktok5,
  },
  {
    whatsapp: true,
    emoji: "🎁",
    title: "Coffrets & Cadeaux",
    description: "Composez un coffret sur mesure avec notre équipe",
    image: tiktok6,
  },
];

const TRUST_BADGES = [
  { icon: SparkleIcon, title: "Sélection soignée", text: "Choisie avec exigence" },
  { icon: TruckIcon, title: "Livraison Dakar", text: "Rapide et suivie" },
  { icon: LockIcon, title: "Paiement sécurisé", text: "Via PayDunya" },
  { icon: ChatIcon, title: "Toujours disponible", text: "Sur WhatsApp" },
];

const CATEGORY_ICONS = [
  { icon: FlowerIcon, label: "Floral", category: "Floral" },
  { icon: TreeIcon, label: "Boisé", category: "Boisé" },
  { icon: SunsetIcon, label: "Oriental", category: "Oriental" },
  { icon: CitrusIcon, label: "Hespéridé", category: "Hespéridé" },
  { icon: DropletIcon, label: "Soin visage", category: "Soin visage" },
  { icon: SpaIcon, label: "Soin corps", category: "Soin corps" },
  { icon: BagIcon, label: "Sacs", category: "Sacs" },
  { icon: GemIcon, label: "Bijoux", category: "Bijoux" },
];

const HOME_REVIEWS = [
  {
    author: "Aïssatou D.",
    rating: 5,
    text: "Toujours des produits authentiques et un service adorable. Faty Store est devenu mon adresse beauté préférée !",
  },
  {
    author: "Fatou S.",
    rating: 5,
    text: "La livraison est rapide et les parfums tiennent vraiment toute la journée.",
  },
  {
    author: "Mariama B.",
    rating: 4,
    text: "Très bon accueil sur WhatsApp, on se sent bien conseillée avant d'acheter.",
  },
];

const WHY_CHOOSE = [
  { icon: HeartIcon, title: "Sélection exigeante", text: "Des produits choisis avec soin pour leur qualité." },
  { icon: RocketIcon, title: "Livraison rapide", text: "Expédition soignée partout à Dakar et environs." },
  { icon: ShieldIcon, title: "Paiement sécurisé", text: "Transactions protégées grâce à PayDunya." },
  { icon: MailIcon, title: "Un service à l'écoute", text: "Une équipe disponible pour vous conseiller." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState(null);
  const [shoppablePosts, setShoppablePosts] = useState([]);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState(null);
  const [newsletterError, setNewsletterError] = useState(null);

  useEffect(() => {
    api
      .getProducts({ featured: "true" })
      .then(setFeatured)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    api
      .getProducts({})
      .then((products) =>
        setShoppablePosts(products.filter((p) => SHOPPABLE_PHOTO_URLS.includes(p.image_url)))
      )
      .catch(() => {});
  }, []);

  async function handleNewsletterSubmit(e) {
    e.preventDefault();
    setNewsletterError(null);
    setNewsletterMessage(null);
    try {
      await api.subscribeNewsletter(newsletterEmail);
      setNewsletterMessage("Merci ! Vous êtes bien inscrite à notre newsletter.");
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterError(err.message);
    }
  }

  return (
    <div>
      <HeroSlider slides={HERO_SLIDES} />

      <div className="container trust-badges glass">
        {TRUST_BADGES.map((badge) => (
          <div className="trust-badge" key={badge.title}>
            <span className="trust-badge-icon">
              <badge.icon size={22} />
            </span>
            <div>
              <h4>{badge.title}</h4>
              <p>{badge.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Reveal as="section" className="container featured-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Sélection</span>
            <h2>Produits vedettes</h2>
          </div>
          <Link to="/catalogue">Tout voir →</Link>
        </div>
        {error && <p className="error-text">{error}</p>}
        <ProductCarousel products={featured} />
      </Reveal>

      <Reveal as="section" className="container">
        <div className="wishlist-promo">
          <span className="wishlist-promo-icon">
            <HeartIcon size={20} filled />
          </span>
          <div>
            <strong>Wishlist</strong>
            <p>Enregistrez vos coups de cœur et retrouvez-les à tout moment.</p>
          </div>
          <Link to="/favoris" className="btn btn-primary">
            Voir ma wishlist
          </Link>
        </div>

        <div className="section-heading">
          <h2>Collections</h2>
          <Link to="/catalogue">Voir tout</Link>
        </div>
        <div className="collections-grid">
          {COLLECTIONS.map((col) =>
            col.whatsapp ? (
              <a
                href={whatsappLink(
                  "Bonjour Faty Store 👋 Je souhaite composer un coffret cadeau sur mesure."
                )}
                target="_blank"
                rel="noreferrer"
                className="collection-card"
                key={col.title}
              >
                <img src={col.image} alt={col.title} />
                <span className="collection-card-emoji">{col.emoji}</span>
                <div className="collection-card-label">
                  <h3>{col.title}</h3>
                  <p>{col.description}</p>
                  <span className="collection-card-cta">Nous écrire →</span>
                </div>
              </a>
            ) : (
              <Link to={col.to} className="collection-card" key={col.title}>
                <img src={col.image} alt={col.title} />
                <span className="collection-card-emoji">{col.emoji}</span>
                <div className="collection-card-label">
                  <h3>{col.title}</h3>
                  <p>{col.description}</p>
                  <span className="collection-card-cta">Découvrir →</span>
                </div>
              </Link>
            )
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="promo-banner">
          <div className="promo-banner-text">
            <h2>Retrait en boutique</h2>
            <p>
              Rendez-vous à Ouest Foire pour récupérer votre commande, ou faites-vous livrer
              directement à Dakar.
            </p>
            <div className="promo-actions">
              <Link to="/catalogue" className="btn btn-primary">
                Commander maintenant
              </Link>
              <a
                href={whatsappLink(GENERAL_MESSAGE)}
                className="btn btn-whatsapp"
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={18} /> Commander sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="section-heading">
          <h2>Parcourir par catégorie</h2>
        </div>
        <div className="category-icons-grid">
          {CATEGORY_ICONS.map((cat) => (
            <Link
              to={`/catalogue?category=${encodeURIComponent(cat.category)}`}
              className="category-icon-card"
              key={cat.category}
            >
              <span className="category-icon-circle">
                <cat.icon size={26} />
              </span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="section-heading">
          <h2>Pourquoi choisir Faty Store</h2>
        </div>
        <div className="why-choose-grid">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title}>
              <div className="why-choose-icon">
                <item.icon size={26} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="section-heading">
          <h2>Elles nous font confiance</h2>
        </div>
        <div className="reviews-grid">
          {HOME_REVIEWS.map((review) => (
            <div className="review-card" key={review.author}>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} size={14} filled={n <= review.rating} />
                ))}
              </div>
              <p>« {review.text} »</p>
              <p className="review-author">{review.author}</p>
            </div>
          ))}
        </div>
        <p className="testimonial-note">Exemples d'avis — à remplacer par vos vrais avis clients.</p>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="newsletter-section">
          <h2>Restez à la mode</h2>
          <p>Inscrivez-vous pour recevoir nos nouveautés et offres exclusives.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">
              S'inscrire
            </button>
          </form>
          {newsletterMessage && <p className="newsletter-message success-text">{newsletterMessage}</p>}
          {newsletterError && <p className="newsletter-message error-text">{newsletterError}</p>}
        </div>
      </Reveal>

      <Reveal as="section" className="container">
        <div className="section-heading">
          <h2>Suivez-nous sur Instagram</h2>
          <a href="https://instagram.com/fatystore01" target="_blank" rel="noreferrer">
            @fatystore01
          </a>
        </div>
        <div className="marquee instagram-marquee">
          <div className="marquee-track">
            {/* Liste doublée pour une boucle continue ; la copie est masquée aux lecteurs d'écran. */}
            {[...shoppablePosts, ...shoppablePosts].map((product, i) => {
              const isCopy = i >= shoppablePosts.length;
              return (
                <Link
                  to={`/produit/${product.id}`}
                  key={`${product.id}-${i}`}
                  className="instagram-item"
                  aria-hidden={isCopy}
                  tabIndex={isCopy ? -1 : undefined}
                >
                  <img src={product.image_url} alt={product.name} loading="lazy" />
                  <span className="instagram-overlay">{product.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
