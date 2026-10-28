import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Um tamanho disponível para o produto (ex.: Pequena 25cm). */
export type ProductSize = {
  id: string;
  label: string;
  detail: string;
  priceCents: number;
};

export type AddonChoice = {
  id: number;
  name: string;
  priceCents: number;
};

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  position: integer("position").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  /** 'salgada' | 'doce' | null (null = não aceita adicionais) */
  addonScope: text("addon_scope"),
  sizes: jsonb("sizes").$type<ProductSize[]>().notNull(),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  available: boolean("available").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  /** em quais produtos o adicional aparece */
  scope: text("scope").notNull().default("salgada"),
  group: text("group").notNull().default("Extras"),
  position: integer("position").notNull().default(0),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  /** 'percent' | 'amount' | 'free_delivery' */
  kind: text("kind").notNull().default("percent"),
  value: integer("value").notNull().default(0),
  description: text("description").notNull().default(""),
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  /** 'delivery' | 'pickup' */
  fulfillment: text("fulfillment").notNull().default("delivery"),
  street: text("street"),
  houseNumber: text("house_number"),
  complement: text("complement"),
  district: text("district"),
  reference: text("reference"),
  /** 'pix' | 'card' | 'cash' */
  paymentMethod: text("payment_method").notNull().default("pix"),
  cashChangeForCents: integer("cash_change_for_cents"),
  couponCode: text("coupon_code"),
  notes: text("notes"),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  discountCents: integer("discount_cents").notNull().default(0),
  deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  /** received | preparing | oven | delivering | completed | cancelled */
  status: text("status").notNull().default("received"),
  statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  imageUrl: text("image_url"),
  sizeId: text("size_id").notNull(),
  sizeLabel: text("size_label").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedAddons: jsonb("selected_addons").$type<AddonChoice[]>().notNull().default([]),
  notes: text("notes"),
  totalCents: integer("total_cents").notNull(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
