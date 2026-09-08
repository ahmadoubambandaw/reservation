import { Router } from "express";
import Stripe from "stripe";
import { pool } from "../db.js";

export const checkoutRouter = Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquant dans l'environnement.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

checkoutRouter.post("/", async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Le panier est vide." });
  }

  const lineItems = [];
  const orderItemsData = [];
  let totalCents = 0;

  for (const item of items) {
    const { rows } = await pool.query("SELECT * FROM faty_store.products WHERE id = $1", [
      item.productId,
    ]);
    const product = rows[0];

    if (!product) {
      return res.status(404).json({ error: `Produit ${item.productId} introuvable.` });
    }
    if (product.stock < item.quantity) {
      return res.status(409).json({ error: `Stock insuffisant pour ${product.name}.` });
    }

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.price_cents,
        product_data: {
          name: `${product.brand} — ${product.name}`,
          description: `${product.volume_ml} ml`,
          images: product.image_url ? [product.image_url] : undefined,
        },
      },
    });

    orderItemsData.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      price_cents: product.price_cents,
    });

    totalCents += product.price_cents * item.quantity;
  }

  const {
    rows: [order],
  } = await pool.query("INSERT INTO faty_store.orders (total_cents, status) VALUES ($1, 'pending') RETURNING id", [
    totalCents,
  ]);
  const orderId = order.id;

  for (const item of orderItemsData) {
    await pool.query(
      "INSERT INTO faty_store.order_items (order_id, product_id, product_name, quantity, price_cents) VALUES ($1, $2, $3, $4, $5)",
      [orderId, item.product_id, item.product_name, item.quantity, item.price_cents]
    );
  }

  try {
    const stripe = getStripe();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: { order_id: String(orderId) },
    });

    await pool.query("UPDATE faty_store.orders SET stripe_session_id = $1 WHERE id = $2", [
      session.id,
      orderId,
    ]);

    res.json({ url: session.url });
  } catch (error) {
    await pool.query("UPDATE faty_store.orders SET status = 'failed' WHERE id = $1", [orderId]);
    res.status(500).json({ error: error.message });
  }
});

checkoutRouter.get("/session/:sessionId", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    const { rows: orderRows } = await pool.query(
      "SELECT * FROM faty_store.orders WHERE stripe_session_id = $1",
      [req.params.sessionId]
    );
    const order = orderRows[0];

    if (order && session.payment_status === "paid" && order.status !== "paid") {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows: items } = await client.query(
          "SELECT * FROM faty_store.order_items WHERE order_id = $1",
          [order.id]
        );
        for (const item of items) {
          await client.query("UPDATE faty_store.products SET stock = stock - $1 WHERE id = $2", [
            item.quantity,
            item.product_id,
          ]);
        }
        await client.query(
          "UPDATE faty_store.orders SET status = 'paid', customer_email = $1 WHERE id = $2",
          [session.customer_details?.email ?? null, order.id]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    const { rows: finalRows } = await pool.query(
      "SELECT * FROM faty_store.orders WHERE stripe_session_id = $1",
      [req.params.sessionId]
    );

    res.json({ status: session.payment_status, order: finalRows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
