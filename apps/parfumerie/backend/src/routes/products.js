import { Router } from "express";
import { pool } from "../db.js";

export const productsRouter = Router();

// La boutique ne vend que des parfums : toutes les routes publiques sont
// restreintes à ce type, quels que soient les paramètres reçus. Les produits
// Soin/Accessoire restent en base (historique de commandes) mais ne sont
// plus jamais exposés au client.
productsRouter.get("/", async (req, res) => {
  const { category, gender, featured } = req.query;

  const conditions = ["type = 'Parfum'"];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (gender) {
    params.push(gender);
    conditions.push(`gender = $${params.length}`);
  }
  if (featured === "true") {
    conditions.push("featured = true");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM faty_store.products ${where} ORDER BY created_at DESC`,
    params
  );
  res.json(rows);
});

productsRouter.get("/categories", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT DISTINCT category FROM faty_store.products WHERE type = 'Parfum' ORDER BY category"
  );

  res.json(rows.map((row) => row.category));
});

productsRouter.get("/:id", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM faty_store.products WHERE id = $1 AND type = 'Parfum'",
    [req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.json(rows[0]);
});
