import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.sqlite");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    volume_ml INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_session_id TEXT UNIQUE,
    customer_email TEXT,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_cents INTEGER NOT NULL
  );
`);

const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get();

if (productCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products
      (name, brand, description, category, gender, volume_ml, price_cents, stock, image_url, featured)
    VALUES (@name, @brand, @description, @category, @gender, @volume_ml, @price_cents, @stock, @image_url, @featured)
  `);

  const seedProducts = [
    {
      name: "Ambre Nocturne",
      brand: "Essence de Luxe",
      description: "Un sillage boisé et ambré, avec des notes de vanille et de patchouli pour les soirées d'exception.",
      category: "Boisé",
      gender: "Mixte",
      volume_ml: 100,
      price_cents: 8900,
      stock: 24,
      image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
      featured: 1,
    },
    {
      name: "Fleur de Jasmin",
      brand: "Essence de Luxe",
      description: "Un bouquet floral lumineux mêlant jasmin, néroli et une touche de musc blanc.",
      category: "Floral",
      gender: "Femme",
      volume_ml: 75,
      price_cents: 7400,
      stock: 30,
      image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
      featured: 1,
    },
    {
      name: "Cuir & Épices",
      brand: "Maison Nomade",
      description: "Cuir intense réchauffé par la cardamome et le poivre noir, pour une signature affirmée.",
      category: "Oriental",
      gender: "Homme",
      volume_ml: 100,
      price_cents: 9900,
      stock: 18,
      image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
      featured: 1,
    },
    {
      name: "Agrumes du Matin",
      brand: "Maison Nomade",
      description: "Une explosion fraîche de bergamote, citron et pamplemousse pour bien commencer la journée.",
      category: "Hespéridé",
      gender: "Mixte",
      volume_ml: 50,
      price_cents: 5400,
      stock: 40,
      image_url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800",
      featured: 0,
    },
    {
      name: "Vanille Sauvage",
      brand: "Essence de Luxe",
      description: "Vanille gourmande, fève tonka et bois de santal pour un parfum enveloppant.",
      category: "Gourmand",
      gender: "Femme",
      volume_ml: 100,
      price_cents: 8200,
      stock: 22,
      image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
      featured: 0,
    },
    {
      name: "Rose Impériale",
      brand: "Maison Nomade",
      description: "Rose de Damas et framboise noire sublimées par un fond de musc précieux.",
      category: "Floral",
      gender: "Femme",
      volume_ml: 75,
      price_cents: 8600,
      stock: 15,
      image_url: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800",
      featured: 0,
    },
    {
      name: "Oud Royal",
      brand: "Essence de Luxe",
      description: "Bois d'oud précieux, safran et rose noire pour une fragrance d'exception.",
      category: "Oriental",
      gender: "Mixte",
      volume_ml: 100,
      price_cents: 14900,
      stock: 10,
      image_url: "https://images.unsplash.com/photo-1595425964272-3a3b7f6f8f96?w=800",
      featured: 1,
    },
    {
      name: "Brise Marine",
      brand: "Maison Nomade",
      description: "Notes aquatiques et iodées, ravivées par un cœur de fleur de sel et de figuier.",
      category: "Aquatique",
      gender: "Homme",
      volume_ml: 100,
      price_cents: 6900,
      stock: 28,
      image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
      featured: 0,
    },
  ];

  const insertMany = db.transaction((products) => {
    for (const product of products) insert.run(product);
  });

  insertMany(seedProducts);
}
