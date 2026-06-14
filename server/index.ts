import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db/index";
import { products, shops, clicks } from "./db/schema";
import { parseFeed } from "./feedParser";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/products - seznam produktů s filtry
app.get("/api/products", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, brand, category, color, material, page = "1" } = req.query;
    const limit = 24;
    const offset = (parseInt(page as string) - 1) * limit;

    let query = db.select().from(products);
    const conditions = [];

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (minPrice) {
      conditions.push(gte(products.price, String(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(products.price, String(maxPrice)));
    }
    if (brand) {
      conditions.push(eq(products.brand, String(brand)));
    }
    if (category) {
      conditions.push(eq(products.category, String(category)));
    }

    const result = await db.select().from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    res.json({ products: result, page: parseInt(page as string) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// GET /api/products/:id - detail produktu
app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await db.select().from(products)
      .where(eq(products.id, parseInt(req.params.id)));
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Produkt nenalezen" });
    }
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// POST /api/click - sledování prokliků
app.post("/api/click", async (req, res) => {
  try {
    const { productId, shopId } = req.body;
    await db.insert(clicks).values({
      productId,
      shopId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// POST /api/admin/import - import feedu
app.post("/api/admin/import", async (req, res) => {
  try {
    const { feedUrl, shopName, shopUrl } = req.body;
    
    const parsed = await parseFeed(feedUrl, shopName, shopUrl);
    console.log(`[Import] Načteno ${parsed.length} produktů`);
    
    for (const product of parsed) {
      await db.insert(products).values(product).onConflictDoUpdate({
        target: products.externalId,
        set: {
          name: product.name,
          description: product.description,
          price: product.price,
          imgUrl: product.imgUrl,
          productUrl: product.productUrl,
          brand: product.brand,
          category: product.category,
          params: product.params,
          updatedAt: new Date(),
        },
      });
    }
    
    res.json({ success: true, count: parsed.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chyba při importu" });
  }
});

// GET /api/filters - dostupné hodnoty filtrů
app.get("/api/filters", async (req, res) => {
  try {
    const brands = await db.selectDistinct({ brand: products.brand }).from(products).where(sql`${products.brand} is not null`);
    const categories = await db.selectDistinct({ category: products.category }).from(products).where(sql`${products.category} is not null`);
    
    res.json({
      brands: brands.map(b => b.brand),
      categories: categories.map(c => c.category),
    });
  } catch (error) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Server] Běží na portu ${PORT}`);
});