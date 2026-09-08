import { Router } from "express";
import { pool } from "../db.js";

export const newsletterRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

newsletterRouter.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  await pool.query(
    "INSERT INTO faty_store.newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
    [email.toLowerCase()]
  );

  res.status(201).json({ ok: true });
});
