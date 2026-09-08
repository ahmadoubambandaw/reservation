import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, email, name FROM admin_users WHERE id = ?")
    .get(req.user.userId);

  if (!user) {
    return res.status(404).json({ error: "Compte introuvable." });
  }

  res.json(user);
});

authRouter.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Mot de passe actuel requis, nouveau mot de passe d'au moins 6 caractères." });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(req.user.userId);

  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Mot de passe actuel incorrect." });
  }

  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(
    bcrypt.hashSync(newPassword, 10),
    user.id
  );

  res.json({ ok: true });
});
