import { GENERAL_MESSAGE, whatsappLink } from "../whatsapp.js";
import { WhatsAppIcon } from "./Icons.jsx";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink(GENERAL_MESSAGE)}
      className="whatsapp-float"
      target="_blank"
      rel="noreferrer"
      aria-label="Commander sur WhatsApp"
    >
      <span className="whatsapp-float-icon">
        <WhatsAppIcon size={26} />
      </span>
      <span className="whatsapp-float-label">
        <strong>Commander sur WhatsApp</strong>
        <small>Réponse rapide · 76 179 68 58</small>
      </span>
    </a>
  );
}
