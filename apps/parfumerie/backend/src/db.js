import bcrypt from "bcryptjs";
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function init() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS faty_store;

    CREATE TABLE IF NOT EXISTS faty_store.products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'Parfum',
      category TEXT NOT NULL DEFAULT 'Autre',
      gender TEXT NOT NULL DEFAULT 'Mixte',
      volume_ml INTEGER NOT NULL DEFAULT 0,
      price_xof INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS faty_store.orders (
      id BIGSERIAL PRIMARY KEY,
      payment_token TEXT UNIQUE,
      customer_email TEXT,
      total_xof INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS faty_store.order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES faty_store.orders(id),
      product_id BIGINT NOT NULL REFERENCES faty_store.products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_xof INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faty_store.admin_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS faty_store.newsletter_subscribers (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const {
    rows: [{ count: userCount }],
  } = await pool.query("SELECT COUNT(*)::int AS count FROM faty_store.admin_users");

  if (userCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await pool.query(
      "INSERT INTO faty_store.admin_users (email, password_hash, name) VALUES ($1, $2, $3)",
      [
        process.env.ADMIN_EMAIL.toLowerCase(),
        bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        process.env.ADMIN_NAME || "Propriétaire",
      ]
    );
  }

  const {
    rows: [{ count: productCount }],
  } = await pool.query("SELECT COUNT(*)::int AS count FROM faty_store.products");

  if (productCount === 0) {
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
        price_xof: 58500,
        stock: 24,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-5-gold-trio.jpg",
        featured: true,
      },
      {
        name: "Fleur de Jasmin",
        brand: "Essence de Luxe",
        description: "Un bouquet floral lumineux mêlant jasmin, néroli et une touche de musc blanc.",
        type: "Parfum",
        category: "Floral",
        gender: "Femme",
        volume_ml: 75,
        price_xof: 48500,
        stock: 30,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-2-violet-blossom.jpg",
        featured: true,
      },
      {
        name: "Cuir & Épices",
        brand: "Maison Nomade",
        description: "Cuir intense réchauffé par la cardamome et le poivre noir, pour une signature affirmée.",
        type: "Parfum",
        category: "Oriental",
        gender: "Homme",
        volume_ml: 100,
        price_xof: 65000,
        stock: 18,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-1-ysl.jpg",
        featured: true,
      },
      {
        name: "Agrumes du Matin",
        brand: "Maison Nomade",
        description: "Une explosion fraîche de bergamote, citron et pamplemousse pour bien commencer la journée.",
        type: "Parfum",
        category: "Hespéridé",
        gender: "Mixte",
        volume_ml: 50,
        price_xof: 35500,
        stock: 40,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-6-vials.jpg",
        featured: false,
      },
      {
        name: "Vanille Sauvage",
        brand: "Essence de Luxe",
        description: "Vanille gourmande, fève tonka et bois de santal pour un parfum enveloppant.",
        type: "Parfum",
        category: "Gourmand",
        gender: "Femme",
        volume_ml: 100,
        price_xof: 54000,
        stock: 22,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-3-hypnotic.jpg",
        featured: false,
      },
      {
        name: "Rose Impériale",
        brand: "Maison Nomade",
        description: "Rose de Damas et framboise noire sublimées par un fond de musc précieux.",
        type: "Parfum",
        category: "Floral",
        gender: "Femme",
        volume_ml: 75,
        price_xof: 56500,
        stock: 15,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-2-violet-blossom.jpg",
        featured: false,
      },
      {
        name: "Oud Royal",
        brand: "Essence de Luxe",
        description: "Bois d'oud précieux, safran et rose noire pour une fragrance d'exception.",
        type: "Parfum",
        category: "Oriental",
        gender: "Mixte",
        volume_ml: 100,
        price_xof: 98000,
        stock: 10,
        image_url:
          "https://raw.githubusercontent.com/ahmadoubambandaw/reservation/claude/fervent-shannon-2vkwes/apps/parfumerie/frontend/src/assets/tiktok-4-my-way.jpg",
        featured: true,
      },
      {
        name: "Brise Marine",
        brand: "Maison Nomade",
        description: "Notes aquatiques et iodées, ravivées par un cœur de fleur de sel et de figuier.",
        type: "Parfum",
        category: "Aquatique",
        gender: "Homme",
        volume_ml: 100,
        price_xof: 45000,
        stock: 28,
        image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
        featured: false,
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
        price_xof: 42500,
        stock: 20,
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        featured: true,
      },
      {
        name: "Sérum Vitamine C",
        brand: "Faty Care",
        description: "Sérum concentré en vitamine C pour unifier le teint et raviver l'éclat naturel de la peau.",
        type: "Soin",
        category: "Soin visage",
        gender: "Mixte",
        volume_ml: 30,
        price_xof: 52000,
        stock: 16,
        image_url: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800",
        featured: true,
      },
      {
        name: "Baume Corps Karité",
        brand: "Faty Care",
        description: "Baume nourrissant au beurre de karité pur, pour une peau douce et souple toute la journée.",
        type: "Soin",
        category: "Soin corps",
        gender: "Mixte",
        volume_ml: 200,
        price_xof: 34000,
        stock: 25,
        image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
        featured: false,
      },
      {
        name: "Huile Démêlante Cheveux",
        brand: "Faty Care",
        description: "Huile légère qui démêle, nourrit et fait briller les cheveux sans les alourdir.",
        type: "Soin",
        category: "Soin cheveux",
        gender: "Mixte",
        volume_ml: 100,
        price_xof: 31500,
        stock: 30,
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        featured: false,
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
        price_xof: 104000,
        stock: 8,
        image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        featured: true,
      },
      {
        name: "Écharpe Soie Imprimée",
        brand: "Faty Store",
        description: "Écharpe en soie douce à motifs raffinés, l'accessoire parfait pour sublimer une tenue.",
        type: "Accessoire",
        category: "Écharpes",
        gender: "Femme",
        volume_ml: 0,
        price_xof: 45000,
        stock: 14,
        image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
        featured: false,
      },
      {
        name: "Créoles Dorées",
        brand: "Faty Store",
        description: "Boucles d'oreilles créoles plaquées or, intemporelles et lumineuses.",
        type: "Accessoire",
        category: "Bijoux",
        gender: "Femme",
        volume_ml: 0,
        price_xof: 29500,
        stock: 20,
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        featured: true,
      },
      {
        name: "Portefeuille Compact",
        brand: "Faty Store",
        description: "Petit portefeuille pratique en simili-cuir, avec de nombreux compartiments pour cartes et monnaie.",
        type: "Accessoire",
        category: "Maroquinerie",
        gender: "Mixte",
        volume_ml: 0,
        price_xof: 25500,
        stock: 18,
        image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
        featured: false,
      },
    ];

    for (const p of seedProducts) {
      await pool.query(
        `INSERT INTO faty_store.products
          (name, brand, description, type, category, gender, volume_ml, price_xof, stock, image_url, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          p.name,
          p.brand,
          p.description,
          p.type,
          p.category,
          p.gender,
          p.volume_ml,
          p.price_xof,
          p.stock,
          p.image_url,
          p.featured,
        ]
      );
    }
  }
}

export const ready = init();
// Empêche un crash du process si la base est injoignable au démarrage ;
// chaque appelant qui fait `await ready` récupère quand même le rejet.
ready.catch(() => {});
