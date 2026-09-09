import { Router } from "express";
import { pool } from "../db.js";

export const checkoutRouter = Router();

const PAYDUNYA_BASE_URL = (process.env.PAYDUNYA_PRIVATE_KEY || "").startsWith("test_")
  ? "https://app.paydunya.com/sandbox-api/v1"
  : "https://app.paydunya.com/api/v1";

function paydunyaHeaders() {
  const { PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY, PAYDUNYA_TOKEN } = process.env;

  if (!PAYDUNYA_MASTER_KEY || !PAYDUNYA_PRIVATE_KEY || !PAYDUNYA_PUBLIC_KEY || !PAYDUNYA_TOKEN) {
    throw new Error("Identifiants PayDunya manquants dans l'environnement.");
  }

  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY,
    "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY,
    "PAYDUNYA-PUBLIC-KEY": PAYDUNYA_PUBLIC_KEY,
    "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN,
  };
}

checkoutRouter.post("/", async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Le panier est vide." });
  }

  const orderItemsData = [];
  const invoiceItems = {};
  let totalXof = 0;
  let index = 0;

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

    const lineTotal = product.price_xof * item.quantity;

    invoiceItems[`item_${index}`] = {
      name: `${product.brand} — ${product.name}`,
      quantity: item.quantity,
      unit_price: product.price_xof,
      total_price: lineTotal,
      description: product.volume_ml > 0 ? `${product.volume_ml} ml` : "",
    };
    index += 1;

    orderItemsData.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      price_xof: product.price_xof,
    });

    totalXof += lineTotal;
  }

  const {
    rows: [order],
  } = await pool.query(
    "INSERT INTO faty_store.orders (total_xof, status) VALUES ($1, 'pending') RETURNING id",
    [totalXof]
  );
  const orderId = order.id;

  for (const item of orderItemsData) {
    await pool.query(
      "INSERT INTO faty_store.order_items (order_id, product_id, product_name, quantity, price_xof) VALUES ($1, $2, $3, $4, $5)",
      [orderId, item.product_id, item.product_name, item.quantity, item.price_xof]
    );
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const response = await fetch(`${PAYDUNYA_BASE_URL}/checkout-invoice/create`, {
      method: "POST",
      headers: paydunyaHeaders(),
      body: JSON.stringify({
        invoice: {
          total_amount: totalXof,
          description: "Commande Faty Store — Beauty & Co",
          items: invoiceItems,
        },
        store: {
          name: "Faty Store — Beauty & Co",
        },
        actions: {
          cancel_url: `${frontendUrl}/checkout/cancel`,
          return_url: `${frontendUrl}/checkout/success?order_id=${orderId}`,
        },
        custom_data: { order_id: String(orderId) },
      }),
    });

    const data = await response.json();

    if (data.response_code !== "00" || !data.token) {
      throw new Error(data.response_text || "Impossible de créer la facture PayDunya.");
    }

    await pool.query("UPDATE faty_store.orders SET payment_token = $1 WHERE id = $2", [
      data.token,
      orderId,
    ]);

    res.json({ url: `https://app.paydunya.com/checkout/invoice/${data.token}` });
  } catch (error) {
    console.error("Échec de création de facture PayDunya :", error.message);
    await pool.query("UPDATE faty_store.orders SET status = 'failed' WHERE id = $1", [orderId]);
    res.status(500).json({ error: error.message });
  }
});

checkoutRouter.get("/session/:orderId", async (req, res) => {
  try {
    const { rows: orderRows } = await pool.query("SELECT * FROM faty_store.orders WHERE id = $1", [
      req.params.orderId,
    ]);
    const order = orderRows[0];

    if (!order) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    if (order.status === "paid") {
      return res.json({ status: "paid", order });
    }

    if (!order.payment_token) {
      return res.json({ status: order.status, order });
    }

    const response = await fetch(
      `${PAYDUNYA_BASE_URL}/checkout-invoice/confirm/${order.payment_token}`,
      { headers: paydunyaHeaders() }
    );
    const data = await response.json();

    if (data.status === "completed" && order.status !== "paid") {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows: orderItems } = await client.query(
          "SELECT * FROM faty_store.order_items WHERE order_id = $1",
          [order.id]
        );
        for (const item of orderItems) {
          await client.query("UPDATE faty_store.products SET stock = stock - $1 WHERE id = $2", [
            item.quantity,
            item.product_id,
          ]);
        }
        await client.query(
          "UPDATE faty_store.orders SET status = 'paid', customer_email = $1 WHERE id = $2",
          [data.customer?.email ?? null, order.id]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else if (data.status === "cancelled" && order.status !== "cancelled") {
      await pool.query("UPDATE faty_store.orders SET status = 'cancelled' WHERE id = $1", [order.id]);
    }

    const { rows: finalRows } = await pool.query("SELECT * FROM faty_store.orders WHERE id = $1", [
      order.id,
    ]);
    const finalOrder = finalRows[0];

    res.json({ status: finalOrder.status === "paid" ? "paid" : data.status, order: finalOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
