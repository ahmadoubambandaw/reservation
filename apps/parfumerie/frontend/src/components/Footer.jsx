export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-columns">
        <div className="footer-col">
          <p className="footer-heading">Retrouvez-nous sur</p>
          <p>
            <span className="footer-icon">👻</span> Snapchat : mastoumbaye21
          </p>
          <p>
            <span className="footer-icon">🎵</span> TikTok : fatystore01
          </p>
          <p>
            <span className="footer-icon">📷</span> Instagram : fatystore01
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Nous contacter</p>
          <p>
            <span className="footer-icon">📍</span> Adresse : Ouest Foire
          </p>
          <p>
            <span className="footer-icon">💬</span> WhatsApp : 76 179 68 58
          </p>
          <p>
            <span className="footer-icon">📞</span> Téléphone : 70 111 89 74
          </p>
        </div>
      </div>
      <div className="footer-tagline">
        ✦ Révélez votre éclat, chaque jour. ✦
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Faty Store — Beauty & Co · Votre beauté, notre priorité</p>
      </div>
    </footer>
  );
}
