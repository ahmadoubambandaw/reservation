import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get("/products", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM faty_store.products ORDER BY created_at DESC");
  res.json(rows);
});

adminRouter.post("/products", async (req, res) => {
  const { name, brand, description, type, category, gender, volume_ml, price_cents, stock, image_url, featured } =
    req.body;

  if (!name || !brand || !price_cents) {
    return res.status(400).json({ error: "Nom, marque et prix sont obligatoires." });
  }

  const { rows } = await pool.query(
    `INSERT INTO faty_store.products
      (name, brand, description, type, category, gender, volume_ml, price_cents, stock, image_url, featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      name,
      brand,
      description ?? "",
      type ?? "Parfum",
      category ?? "Autre",
      gender ?? "Mixte",
      volume_ml ?? 0,
      price_cents,
      stock ?? 0,
      image_url ?? "",
      Boolean(featured),
    ]
  );

  res.status(201).json(rows[0]);
});

adminRouter.put("/products/:id", async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM faty_store.products WHERE id = $1", [
    req.params.id,
  ]);
  const existing = existingRows[0];

  if (!existing) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  const merged = { ...existing, ...req.body };

  const { rows } = await pool.query(
    `UPDATE faty_store.products SET
      name = $1, brand = $2, description = $3, type = $4, category = $5, gender = $6,
      volume_ml = $7, price_cents = $8, stock = $9, image_url = $10, featured = $11
     WHERE id = $12
     RETURNING *`,
    [
      merged.name,
      merged.brand,
      merged.description,
      merged.type,
      merged.category,
      merged.gender,
      merged.volume_ml,
      merged.price_cents,
      merged.stock,
      merged.image_url,
      Boolean(merged.featured),
      req.params.id,
    ]
  );

  res.json(rows[0]);
});

adminRouter.delete("/products/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM faty_store.products WHERE id = $1", [req.params.id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.status(204).end();
});

adminRouter.get("/orders", async (req, res) => {
  const { rows: orders } = await pool.query("SELECT * FROM faty_store.orders ORDER BY created_at DESC");

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const { rows: items } = await pool.query(
        "SELECT * FROM faty_store.order_items WHERE order_id = $1",
        [order.id]
      );
      return { ...order, items };
    })
  );

  res.json(ordersWithItems);
});

adminRouter.get("/newsletter", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM faty_store.newsletter_subscribers ORDER BY created_at DESC"
  );
  res.json(rows);
});
