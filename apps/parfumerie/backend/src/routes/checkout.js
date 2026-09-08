import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db.js";

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

  const productStmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const lineItems = [];
  const orderItemsData = [];
  let totalCents = 0;

  for (const item of items) {
    const product = productStmt.get(item.productId);

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

  const orderResult = db
    .prepare("INSERT INTO orders (total_cents, status) VALUES (?, 'pending')")
    .run(totalCents);
  const orderId = orderResult.lastInsertRowid;

  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_cents) VALUES (?, ?, ?, ?, ?)"
  );
  for (const item of orderItemsData) {
    insertItem.run(orderId, item.product_id, item.product_name, item.quantity, item.price_cents);
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

    db.prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?").run(session.id, orderId);

    res.json({ url: session.url });
  } catch (error) {
    db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(orderId);
    res.status(500).json({ error: error.message });
  }
});

checkoutRouter.get("/session/:sessionId", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    const order = db
      .prepare("SELECT * FROM orders WHERE stripe_session_id = ?")
      .get(req.params.sessionId);

    if (order && session.payment_status === "paid" && order.status !== "paid") {
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
      const decrementStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

      const markPaid = db.transaction(() => {
        for (const item of items) {
          decrementStock.run(item.quantity, item.product_id);
        }
        db.prepare("UPDATE orders SET status = 'paid', customer_email = ? WHERE id = ?").run(
          session.customer_details?.email ?? null,
          order.id
        );
      });
      markPaid();
    }

    res.json({
      status: session.payment_status,
      order: db.prepare("SELECT * FROM orders WHERE stripe_session_id = ?").get(req.params.sessionId),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
