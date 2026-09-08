import { Link } from "react-router-dom";
import { CameraIcon, ChatIcon, GhostIcon, MusicIcon, PhoneIcon, PinIcon } from "./Icons.jsx";

const monogram =
  "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/fs-monogram.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-columns">
        <div className="footer-col">
          <div className="footer-brand">
            <img src={monogram} alt="Faty Store" />
            <strong>Faty Store</strong>
          </div>
          <p className="footer-desc">
            Parfums, soins premium et accessoires chic, sélectionnés avec exigence pour révéler
            votre beauté au quotidien.
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Boutique</p>
          <Link to="/">Accueil</Link>
          <Link to="/catalogue?type=Parfum">Parfums</Link>
          <Link to="/catalogue?type=Soin">Soins</Link>
          <Link to="/catalogue?type=Accessoire">Accessoires</Link>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Nous contacter</p>
          <p>
            <span className="footer-icon"><PinIcon size={16} /></span> Ouest Foire, Dakar
          </p>
          <p>
            <span className="footer-icon"><ChatIcon size={16} /></span> WhatsApp : 76 179 68 58
          </p>
          <p>
            <span className="footer-icon"><PhoneIcon size={16} /></span> 70 111 89 74
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Retrouvez-nous sur</p>
          <a href="https://instagram.com/fatystore01" target="_blank" rel="noreferrer">
            <span className="footer-icon"><CameraIcon size={16} /></span> Instagram : fatystore01
          </a>
          <a href="https://www.tiktok.com/@fatystore01" target="_blank" rel="noreferrer">
            <span className="footer-icon"><MusicIcon size={16} /></span> TikTok : fatystore01
          </a>
          <p>
            <span className="footer-icon"><GhostIcon size={16} /></span> Snapchat : mastoumbaye21
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Faty Store — Beauty & Co · Votre beauté, notre priorité</p>
      </div>
    </footer>
  );
}
