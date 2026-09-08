import bcrypt from "bcryptjs";
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
    type TEXT NOT NULL DEFAULT 'Parfum',
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    volume_ml INTEGER NOT NULL DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const userCount = db.prepare("SELECT COUNT(*) AS count FROM admin_users").get();

if (userCount.count === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  db.prepare("INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)").run(
    process.env.ADMIN_EMAIL.toLowerCase(),
    bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    process.env.ADMIN_NAME || "Propriétaire"
  );
}

const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get();

if (productCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products
      (name, brand, description, type, category, gender, volume_ml, price_cents, stock, image_url, featured)
    VALUES (@name, @brand, @description, @type, @category, @gender, @volume_ml, @price_cents, @stock, @image_url, @featured)
  `);

  const seedProducts = [
    // Parfums
    {
      name: "Ambre Nocturne",
      brand: "Essence de Luxe",
      description: "Un sillage boisé et ambré, avec des notes de vanille et de patchouli pour les soirées d'exception.",
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
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
      type: "Parfum",
      category: "Aquatique",
      gender: "Homme",
      volume_ml: 100,
      price_cents: 6900,
      stock: 28,
      image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
      featured: 0,
    },
    // Soins
    {
      name: "Crème Hydratante Éclat",
      brand: "Faty Care",
      description: "Crème visage riche en beurre de karité et acide hyaluronique pour une peau repulpée et lumineuse.",
      type: "Soin",
      category: "Soin visage",
      gender: "Mixte",
      volume_ml: 50,
      price_cents: 6500,
      stock: 20,
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      featured: 1,
    },
    {
      name: "Sérum Vitamine C",
      brand: "Faty Care",
      description: "Sérum concentré en vitamine C pour unifier le teint et raviver l'éclat naturel de la peau.",
      type: "Soin",
      category: "Soin visage",
      gender: "Mixte",
      volume_ml: 30,
      price_cents: 7900,
      stock: 16,
      image_url: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800",
      featured: 1,
    },
    {
      name: "Baume Corps Karité",
      brand: "Faty Care",
      description: "Baume nourrissant au beurre de karité pur, pour une peau douce et souple toute la journée.",
      type: "Soin",
      category: "Soin corps",
      gender: "Mixte",
      volume_ml: 200,
      price_cents: 5200,
      stock: 25,
      image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
      featured: 0,
    },
    {
      name: "Huile Démêlante Cheveux",
      brand: "Faty Care",
      description: "Huile légère qui démêle, nourrit et fait briller les cheveux sans les alourdir.",
      type: "Soin",
      category: "Soin cheveux",
      gender: "Mixte",
      volume_ml: 100,
      price_cents: 4800,
      stock: 30,
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      featured: 0,
    },
    // Accessoires
    {
      name: "Sac à Main Cuir Beige",
      brand: "Faty Store",
      description: "Sac à main en cuir vegan beige, spacieux et élégant, pour twister toutes vos tenues.",
      type: "Accessoire",
      category: "Sacs",
      gender: "Femme",
      volume_ml: 0,
      price_cents: 15900,
      stock: 8,
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      featured: 1,
    },
    {
      name: "Écharpe Soie Imprimée",
      brand: "Faty Store",
      description: "Écharpe en soie douce à motifs raffinés, l'accessoire parfait pour sublimer une tenue.",
      type: "Accessoire",
      category: "Écharpes",
      gender: "Femme",
      volume_ml: 0,
      price_cents: 6900,
      stock: 14,
      image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
      featured: 0,
    },
    {
      name: "Créoles Dorées",
      brand: "Faty Store",
      description: "Boucles d'oreilles créoles plaquées or, intemporelles et lumineuses.",
      type: "Accessoire",
      category: "Bijoux",
      gender: "Femme",
      volume_ml: 0,
      price_cents: 4500,
      stock: 20,
      image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
      featured: 1,
    },
    {
      name: "Portefeuille Compact",
      brand: "Faty Store",
      description: "Petit portefeuille pratique en simili-cuir, avec de nombreux compartiments pour cartes et monnaie.",
      type: "Accessoire",
      category: "Maroquinerie",
      gender: "Mixte",
      volume_ml: 0,
      price_cents: 3900,
      stock: 18,
      image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
      featured: 0,
    },
  ];

  const insertMany = db.transaction((products) => {
    for (const product of products) insert.run(product);
  });

  insertMany(seedProducts);
}
