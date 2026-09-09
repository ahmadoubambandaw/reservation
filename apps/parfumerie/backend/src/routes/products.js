import { Router } from "express";
import { pool } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  const { type, category, gender, featured } = req.query;

  const conditions = [];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
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
  const { type } = req.query;

  const { rows } = type
    ? await pool.query(
        "SELECT DISTINCT category FROM faty_store.products WHERE type = $1 ORDER BY category",
        [type]
      )
    : await pool.query("SELECT DISTINCT category FROM faty_store.products ORDER BY category");

  res.json(rows.map((row) => row.category));
});

productsRouter.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM faty_store.products WHERE id = $1", [
    req.params.id,
  ]);

  if (!rows[0]) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.json(rows[0]);
});
