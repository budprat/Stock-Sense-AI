import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  businessType: text("business_type"), // 'restaurant' | 'retail'
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  unit: text("unit").notNull(), // 'lbs', 'bottles', 'pieces', etc.
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  isPerishable: boolean("is_perishable").default(false),
  shelfLifeDays: integer("shelf_life_days"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  reorderPoint: decimal("reorder_point", { precision: 10, scale: 2 }).notNull(),
  maxStock: decimal("max_stock", { precision: 10, scale: 2 }),
  lastRestocked: timestamp("last_restocked"),
  expirationDate: timestamp("expiration_date"),
  location: text("location"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  userId: integer("user_id").references(() => users.id),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  leadTimeDays: integer("lead_time_days"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  userId: integer("user_id").references(() => users.id),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase order items table
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => purchaseOrders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// AI recommendations table
export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  type: text("type").notNull(), // 'reorder', 'promotion', 'emergency', 'waste_alert'
  priority: text("priority").notNull(), // 'low', 'medium', 'high', 'critical'
  message: text("message").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  recommendedAction: text("recommended_action"),
  quantityRecommended: decimal("quantity_recommended", { precision: 10, scale: 2 }),
  isActioned: boolean("is_actioned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Demand forecast table
export const demandForecast = pgTable("demand_forecast", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  forecastDate: timestamp("forecast_date").notNull(),
  predictedDemand: decimal("predicted_demand", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  actualDemand: decimal("actual_demand", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waste tracking table
export const wasteRecords = pgTable("waste_records", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(), // 'expired', 'spoiled', 'damaged', 'other'
  costImpact: decimal("cost_impact", { precision: 10, scale: 2 }),
  wasteDate: timestamp("waste_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  inventory: many(inventory),
  suppliers: many(suppliers),
  purchaseOrders: many(purchaseOrders),
  aiRecommendations: many(aiRecommendations),
  demandForecast: many(demandForecast),
  wasteRecords: many(wasteRecords),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  inventory: many(inventory),
  purchaseOrderItems: many(purchaseOrderItems),
  aiRecommendations: many(aiRecommendations),
  demandForecast: many(demandForecast),
  wasteRecords: many(wasteRecords),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
  user: one(users, { fields: [inventory.userId], references: [users.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, { fields: [suppliers.userId], references: [users.id] }),
  purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchaseOrders.supplierId], references: [suppliers.id] }),
  user: one(users, { fields: [purchaseOrders.userId], references: [users.id] }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  order: one(purchaseOrders, { fields: [purchaseOrderItems.orderId], references: [purchaseOrders.id] }),
  product: one(products, { fields: [purchaseOrderItems.productId], references: [products.id] }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, { fields: [aiRecommendations.userId], references: [users.id] }),
  product: one(products, { fields: [aiRecommendations.productId], references: [products.id] }),
}));

export const demandForecastRelations = relations(demandForecast, ({ one }) => ({
  product: one(products, { fields: [demandForecast.productId], references: [products.id] }),
  user: one(users, { fields: [demandForecast.userId], references: [users.id] }),
}));

export const wasteRecordsRelations = relations(wasteRecords, ({ one }) => ({
  product: one(products, { fields: [wasteRecords.productId], references: [products.id] }),
  user: one(users, { fields: [wasteRecords.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  businessType: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  userId: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWasteRecordSchema = createInsertSchema(wasteRecords).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type WasteRecord = typeof wasteRecords.$inferSelect;
export type InsertWasteRecord = z.infer<typeof insertWasteRecordSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Extended types for API responses
export type InventoryWithProduct = Inventory & {
  product: Product & {
    category: typeof categories.$inferSelect | null;
  };
};

export type AIRecommendationWithProduct = AIRecommendation & {
  product: Product;
};

export type PurchaseOrderWithDetails = PurchaseOrder & {
  supplier: Supplier;
  items: (typeof purchaseOrderItems.$inferSelect & {
    product: Product;
  })[];
};
