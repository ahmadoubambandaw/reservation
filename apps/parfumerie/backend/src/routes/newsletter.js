import { Router } from "express";
import { db } from "../db.js";

export const newsletterRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

newsletterRouter.post("/", (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  try {
    db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email.toLowerCase());
  } catch (error) {
    if (!String(error.message).includes("UNIQUE")) {
      return res.status(500).json({ error: "Une erreur est survenue." });
    }
    // email déjà inscrit : on répond quand même succès pour ne pas révéler l'inscription existante
  }

  res.status(201).json({ ok: true });
});
