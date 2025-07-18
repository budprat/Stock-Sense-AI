import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (compatible with Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed to varchar for Replit Auth compatibility
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessType: text("business_type"), // 'restaurant' | 'retail'
  role: text("role").notNull().default("user"), // 'admin', 'manager', 'user', 'viewer'
  permissions: jsonb("permissions").default([]), // Array of permission strings
  organizationId: integer("organization_id").references(() => organizations.id),
  defaultLocationId: integer("default_location_id").references(() => locations.id),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  businessType: text("business_type"), // 'restaurant' | 'retail' | 'wholesale'
  settings: jsonb("settings").default({}),
  subscriptionPlan: text("subscription_plan").default("basic"), // 'basic', 'pro', 'enterprise'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
  managerId: integer("manager_id").references(() => users.id),
  type: text("type").notNull().default("store"), // 'store', 'warehouse', 'distribution_center'
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User location access table
export const userLocationAccess = pgTable("user_location_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  locationId: integer("location_id").references(() => locations.id),
  accessLevel: text("access_level").notNull().default("read"), // 'read', 'write', 'admin'
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: integer("granted_by").references(() => users.id),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
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
  organizationId: integer("organization_id").references(() => organizations.id),
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
  locationId: integer("location_id").references(() => locations.id),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  reorderPoint: decimal("reorder_point", { precision: 10, scale: 2 }).notNull(),
  maxStock: decimal("max_stock", { precision: 10, scale: 2 }),
  lastRestocked: timestamp("last_restocked"),
  expirationDate: timestamp("expiration_date"),
  storageConditions: jsonb("storage_conditions"),
  location: text("location"), // Legacy field for backward compatibility
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
  organizationId: integer("organization_id").references(() => organizations.id),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  leadTimeDays: integer("lead_time_days"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id),
  permissions: jsonb("permissions").default([]), // Array of permission strings
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permission audit log
export const permissionAuditLog = pgTable("permission_audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // 'granted', 'revoked', 'modified'
  resourceType: text("resource_type").notNull(), // 'user', 'location', 'product', etc.
  resourceId: integer("resource_id"),
  permission: text("permission").notNull(),
  performedBy: integer("performed_by").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  locationId: integer("location_id").references(() => locations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  userId: integer("user_id").references(() => users.id),
  locationId: integer("location_id").references(() => locations.id),
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
  locationId: integer("location_id").references(() => locations.id),
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
  locationId: integer("location_id").references(() => locations.id),
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
  locationId: integer("location_id").references(() => locations.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(), // 'expired', 'spoiled', 'damaged', 'other'
  costImpact: decimal("cost_impact", { precision: 10, scale: 2 }),
  wasteDate: timestamp("waste_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'positive', 'negative', 'bug', 'suggestion'
  message: text("message").notNull(),
  page: text("page").notNull(),
  rating: integer("rating"),
  status: text("status").default("open"), // 'open', 'in-progress', 'resolved'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, { fields: [users.organizationId], references: [organizations.id] }),
  defaultLocation: one(locations, { fields: [users.defaultLocationId], references: [locations.id] }),
  products: many(products),
  inventory: many(inventory),
  suppliers: many(suppliers),
  purchaseOrders: many(purchaseOrders),
  aiRecommendations: many(aiRecommendations),
  demandForecast: many(demandForecast),
  wasteRecords: many(wasteRecords),
  categories: many(categories),
  locationAccess: many(userLocationAccess),
  permissionAuditLog: many(permissionAuditLog),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  locations: many(locations),
  categories: many(categories),
  products: many(products),
  suppliers: many(suppliers),
  roles: many(roles),
  permissionAuditLog: many(permissionAuditLog),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  organization: one(organizations, { fields: [locations.organizationId], references: [organizations.id] }),
  manager: one(users, { fields: [locations.managerId], references: [users.id] }),
  inventory: many(inventory),
  purchaseOrders: many(purchaseOrders),
  aiRecommendations: many(aiRecommendations),
  demandForecast: many(demandForecast),
  wasteRecords: many(wasteRecords),
  userAccess: many(userLocationAccess),
  permissionAuditLog: many(permissionAuditLog),
}));

export const rolesRelations = relations(roles, ({ one }) => ({
  organization: one(organizations, { fields: [roles.organizationId], references: [organizations.id] }),
}));

export const userLocationAccessRelations = relations(userLocationAccess, ({ one }) => ({
  user: one(users, { fields: [userLocationAccess.userId], references: [users.id] }),
  location: one(locations, { fields: [userLocationAccess.locationId], references: [locations.id] }),
  grantedByUser: one(users, { fields: [userLocationAccess.grantedBy], references: [users.id] }),
}));

export const permissionAuditLogRelations = relations(permissionAuditLog, ({ one }) => ({
  user: one(users, { fields: [permissionAuditLog.userId], references: [users.id] }),
  performedByUser: one(users, { fields: [permissionAuditLog.performedBy], references: [users.id] }),
  organization: one(organizations, { fields: [permissionAuditLog.organizationId], references: [organizations.id] }),
  location: one(locations, { fields: [permissionAuditLog.locationId], references: [locations.id] }),
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

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
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

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

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

// Achievement system tables
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  points: integer("points").default(100),
  requirement: jsonb("requirement").notNull(), // Stores achievement criteria
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  totalAchievements: integer("total_achievements").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  wasteFreeDays: integer("waste_free_days").default(0),
  accuratePredictions: integer("accurate_predictions").default(0),
  optimalStockDays: integer("optimal_stock_days").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User types (compatible with Replit Auth)
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export type AchievementWithProgress = Achievement & {
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
};

// Storage conditions tracking
export const storageConditions = pgTable("storage_conditions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  humidity: decimal("humidity", { precision: 5, scale: 2 }).notNull(),
  lightExposure: varchar("light_exposure", { length: 50 }).notNull(), // low, medium, high
  airflow: varchar("airflow", { length: 50 }).notNull(), // poor, adequate, excellent
  containerType: varchar("container_type", { length: 100 }),
  shelfLife: integer("shelf_life_days"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  recordedBy: varchar("recorded_by").references(() => users.id).notNull(),
  notes: text("notes"),
});

// Critical alerts system
export const criticalAlerts = pgTable("critical_alerts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // spoilage, temperature, expiry, stock
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch processing jobs
export const batchJobs = pgTable("batch_jobs", {
  id: serial("id").primaryKey(),
  jobType: varchar("job_type", { length: 50 }).notNull(), // risk_analysis, predictions, alerts
  status: varchar("status", { length: 20 }).notNull(), // pending, running, completed, failed
  totalItems: integer("total_items").notNull(),
  processedItems: integer("processed_items").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  results: jsonb("results"),
  errors: text("errors").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New types for the added tables
export type StorageCondition = typeof storageConditions.$inferSelect;
export type InsertStorageCondition = typeof storageConditions.$inferInsert;
export type CriticalAlert = typeof criticalAlerts.$inferSelect;
export type InsertCriticalAlert = typeof criticalAlerts.$inferInsert;
export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = typeof batchJobs.$inferInsert;

// Lead magnet calculator submissions
export const leadMagnetSubmissions = pgTable("lead_magnet_submissions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  monthlyInventoryValue: decimal("monthly_inventory_value", { precision: 10, scale: 2 }),
  currentWastePercentage: decimal("current_waste_percentage", { precision: 5, scale: 2 }),
  calculatedSavings: decimal("calculated_savings", { precision: 10, scale: 2 }),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  convertedToTrial: boolean("converted_to_trial").default(false),
  convertedAt: timestamp("converted_at"),
});

// Supplier marketplace profiles
export const supplierMarketplace = pgTable("supplier_marketplace", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  joinDate: timestamp("join_date").defaultNow(),
  description: text("description"),
  specialties: text("specialties").array(),
  certifications: text("certifications").array(),
  minimumOrderAmount: decimal("minimum_order_amount", { precision: 10, scale: 2 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  shippingZones: text("shipping_zones").array(),
  isActive: boolean("is_active").default(true),
});

// Supplier price comparisons
export const supplierPrices = pgTable("supplier_prices", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  productId: integer("product_id").references(() => products.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  minimumQuantity: decimal("minimum_quantity", { precision: 10, scale: 2 }).default("1.00"),
  maximumQuantity: decimal("maximum_quantity", { precision: 10, scale: 2 }),
  leadTimeDays: integer("lead_time_days").default(1),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  validFrom: timestamp("valid_from").defaultNow(),
  validTo: timestamp("valid_to"),
});

// Referral program
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").references(() => users.id),
  refereeEmail: varchar("referee_email", { length: 255 }).notNull(),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  rewardType: varchar("reward_type", { length: 50 }).default("credit"),
  createdAt: timestamp("created_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
  rewardPaidAt: timestamp("reward_paid_at"),
});

// Supplier reviews
export const supplierReviews = pgTable("supplier_reviews", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  review: text("review"),
  orderQuality: integer("order_quality"), // 1-5
  deliverySpeed: integer("delivery_speed"), // 1-5
  customerService: integer("customer_service"), // 1-5
  valueForMoney: integer("value_for_money"), // 1-5
  wouldRecommend: boolean("would_recommend").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertStorageConditionSchema = createInsertSchema(storageConditions).omit({
  id: true,
  recordedAt: true,
});

export const insertCriticalAlertSchema = createInsertSchema(criticalAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadMagnetSubmissionSchema = createInsertSchema(leadMagnetSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierMarketplaceSchema = createInsertSchema(supplierMarketplace).omit({
  id: true,
  joinDate: true,
});

export const insertSupplierPriceSchema = createInsertSchema(supplierPrices).omit({
  id: true,
  lastUpdated: true,
  validFrom: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierReviewSchema = createInsertSchema(supplierReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New types
export type LeadMagnetSubmission = typeof leadMagnetSubmissions.$inferSelect;
export type InsertLeadMagnetSubmission = z.infer<typeof insertLeadMagnetSubmissionSchema>;
export type SupplierMarketplace = typeof supplierMarketplace.$inferSelect;
export type InsertSupplierMarketplace = z.infer<typeof insertSupplierMarketplaceSchema>;
export type SupplierPrice = typeof supplierPrices.$inferSelect;
export type InsertSupplierPrice = z.infer<typeof insertSupplierPriceSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type SupplierReview = typeof supplierReviews.$inferSelect;
export type InsertSupplierReview = z.infer<typeof insertSupplierReviewSchema>;
