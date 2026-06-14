import { pgTable, serial, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  imgUrl: text("img_url"),
  productUrl: text("product_url"),
  brand: text("brand"),
  category: text("category"),
  params: jsonb("params"),
  shopName: text("shop_name"),
  shopUrl: text("shop_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  feedUrl: text("feed_url").notNull(),
  cpcPrice: numeric("cpc_price", { precision: 10, scale: 2 }).default("0"),
  active: text("active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  productId: serial("product_id").references(() => products.id),
  shopId: serial("shop_id").references(() => shops.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});