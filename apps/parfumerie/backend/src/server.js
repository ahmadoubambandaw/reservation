import "dotenv/config";
import cors from "cors";
import express from "express";
import "./db.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { checkoutRouter } from "./routes/checkout.js";
import { newsletterRouter } from "./routes/newsletter.js";
import { productsRouter } from "./routes/products.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/auth", authRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API Faty Store démarrée sur http://localhost:${port}`);
});
