import { Router } from "express";
import { db } from "../db.js";

export const productsRouter = Router();

function serialize(product) {
  return { ...product, featured: Boolean(product.featured) };
}

productsRouter.get("/", (req, res) => {
  const { category, gender, featured } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }
  if (featured === "true") {
    query += " AND featured = 1";
  }

  query += " ORDER BY created_at DESC";

  const products = db.prepare(query).all(...params);
  res.json(products.map(serialize));
});

productsRouter.get("/categories", (req, res) => {
  const categories = db
    .prepare("SELECT DISTINCT category FROM products ORDER BY category")
    .all()
    .map((row) => row.category);
  res.json(categories);
});

productsRouter.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.json(serialize(product));
});
