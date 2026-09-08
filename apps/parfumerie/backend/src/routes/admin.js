import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get("/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  res.json(products.map((p) => ({ ...p, featured: Boolean(p.featured) })));
});

adminRouter.post("/products", (req, res) => {
  const { name, brand, description, type, category, gender, volume_ml, price_cents, stock, image_url, featured } =
    req.body;

  if (!name || !brand || !price_cents) {
    return res.status(400).json({ error: "Nom, marque et prix sont obligatoires." });
  }

  const result = db
    .prepare(
      `INSERT INTO products
        (name, brand, description, type, category, gender, volume_ml, price_cents, stock, image_url, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
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
      featured ? 1 : 0
    );

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ...product, featured: Boolean(product.featured) });
});

adminRouter.put("/products/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  const merged = { ...existing, ...req.body };

  db.prepare(
    `UPDATE products SET
      name = ?, brand = ?, description = ?, type = ?, category = ?, gender = ?,
      volume_ml = ?, price_cents = ?, stock = ?, image_url = ?, featured = ?
     WHERE id = ?`
  ).run(
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
    merged.featured ? 1 : 0,
    req.params.id
  );

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json({ ...product, featured: Boolean(product.featured) });
});

adminRouter.delete("/products/:id", (req, res) => {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.status(204).end();
});

adminRouter.get("/orders", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?");

  const ordersWithItems = orders.map((order) => ({
    ...order,
    items: items.all(order.id),
  }));

  res.json(ordersWithItems);
});

adminRouter.get("/newsletter", (req, res) => {
  const subscribers = db
    .prepare("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC")
    .all();
  res.json(subscribers);
});
