import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const { rows } = await pool.query("SELECT * FROM faty_store.admin_users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, name FROM faty_store.admin_users WHERE id = $1",
    [req.user.userId]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Compte introuvable." });
  }

  res.json(rows[0]);
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Mot de passe actuel requis, nouveau mot de passe d'au moins 6 caractères." });
  }

  const { rows } = await pool.query("SELECT * FROM faty_store.admin_users WHERE id = $1", [
    req.user.userId,
  ]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Mot de passe actuel incorrect." });
  }

  await pool.query("UPDATE faty_store.admin_users SET password_hash = $1 WHERE id = $2", [
    bcrypt.hashSync(newPassword, 10),
    user.id,
  ]);

  res.json({ ok: true });
});
