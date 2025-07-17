import {
  users,
  products,
  inventory,
  suppliers,
  aiRecommendations,
  demandForecast,
  wasteRecords,
  categories,
  purchaseOrders,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Inventory,
  type InsertInventory,
  type Supplier,
  type InsertSupplier,
  type AIRecommendation,
  type InsertAIRecommendation,
  type InventoryWithProduct,
  type AIRecommendationWithProduct,
  type WasteRecord,
  type InsertWasteRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number, userId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { userId: number }): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, userId: number): Promise<Product | undefined>;
  deleteProduct(id: number, userId: number): Promise<boolean>;

  // Inventory operations
  getInventory(userId: number): Promise<InventoryWithProduct[]>;
  getInventoryItem(productId: number, userId: number): Promise<InventoryWithProduct | undefined>;
  createInventoryItem(item: InsertInventory & { userId: number }): Promise<Inventory>;
  updateInventoryItem(productId: number, item: Partial<InsertInventory>, userId: number): Promise<Inventory | undefined>;

  // Supplier operations
  getSuppliers(userId: number): Promise<Supplier[]>;
  getSupplier(id: number, userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier & { userId: number }): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>, userId: number): Promise<Supplier | undefined>;

  // AI recommendations
  getAIRecommendations(userId: number): Promise<AIRecommendationWithProduct[]>;
  createAIRecommendation(recommendation: InsertAIRecommendation & { userId: number }): Promise<AIRecommendation>;
  updateAIRecommendation(id: number, recommendation: Partial<InsertAIRecommendation>, userId: number): Promise<AIRecommendation | undefined>;

  // Analytics
  getInventoryHealth(userId: number): Promise<{
    healthy: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  }>;
  getWasteRecords(userId: number): Promise<WasteRecord[]>;
  createWasteRecord(record: InsertWasteRecord & { userId: number }): Promise<WasteRecord>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    totalInventoryValue: number;
    itemsExpiringSoon: number;
    outOfStockItems: number;
    monthlySavings: number;
  }>;

  // Demand forecast
  getDemandForecast(userId: number, productId?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(userId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(asc(products.name));
  }

  async getProduct(id: number, userId: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  async createProduct(product: InsertProduct & { userId: number }): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, userId: number): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.userId, userId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    return result.rowCount > 0;
  }

  async getInventory(userId: number): Promise<InventoryWithProduct[]> {
    const result = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        userId: inventory.userId,
        currentStock: inventory.currentStock,
        reorderPoint: inventory.reorderPoint,
        maxStock: inventory.maxStock,
        lastRestocked: inventory.lastRestocked,
        expirationDate: inventory.expirationDate,
        location: inventory.location,
        updatedAt: inventory.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          sku: products.sku,
          categoryId: products.categoryId,
          userId: products.userId,
          unit: products.unit,
          costPrice: products.costPrice,
          sellingPrice: products.sellingPrice,
          imageUrl: products.imageUrl,
          isPerishable: products.isPerishable,
          shelfLifeDays: products.shelfLifeDays,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            description: categories.description,
            userId: categories.userId,
            createdAt: categories.createdAt,
          },
        },
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(inventory.userId, userId))
      .orderBy(asc(products.name));

    return result as InventoryWithProduct[];
  }

  async getInventoryItem(productId: number, userId: number): Promise<InventoryWithProduct | undefined> {
    const [result] = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        userId: inventory.userId,
        currentStock: inventory.currentStock,
        reorderPoint: inventory.reorderPoint,
        maxStock: inventory.maxStock,
        lastRestocked: inventory.lastRestocked,
        expirationDate: inventory.expirationDate,
        location: inventory.location,
        updatedAt: inventory.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          sku: products.sku,
          categoryId: products.categoryId,
          userId: products.userId,
          unit: products.unit,
          costPrice: products.costPrice,
          sellingPrice: products.sellingPrice,
          imageUrl: products.imageUrl,
          isPerishable: products.isPerishable,
          shelfLifeDays: products.shelfLifeDays,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            description: categories.description,
            userId: categories.userId,
            createdAt: categories.createdAt,
          },
        },
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(inventory.productId, productId), eq(inventory.userId, userId)));

    return result as InventoryWithProduct;
  }

  async createInventoryItem(item: InsertInventory & { userId: number }): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(productId: number, item: Partial<InsertInventory>, userId: number): Promise<Inventory | undefined> {
    const [updatedItem] = await db
      .update(inventory)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(inventory.productId, productId), eq(inventory.userId, userId)))
      .returning();
    return updatedItem;
  }

  async getSuppliers(userId: number): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId))
      .orderBy(asc(suppliers.name));
  }

  async getSupplier(id: number, userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier & { userId: number }): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>, userId: number): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(supplier)
      .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
      .returning();
    return updatedSupplier;
  }

  async getAIRecommendations(userId: number): Promise<AIRecommendationWithProduct[]> {
    const result = await db
      .select({
        id: aiRecommendations.id,
        userId: aiRecommendations.userId,
        productId: aiRecommendations.productId,
        type: aiRecommendations.type,
        priority: aiRecommendations.priority,
        message: aiRecommendations.message,
        confidence: aiRecommendations.confidence,
        recommendedAction: aiRecommendations.recommendedAction,
        quantityRecommended: aiRecommendations.quantityRecommended,
        isActioned: aiRecommendations.isActioned,
        createdAt: aiRecommendations.createdAt,
        updatedAt: aiRecommendations.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          sku: products.sku,
          categoryId: products.categoryId,
          userId: products.userId,
          unit: products.unit,
          costPrice: products.costPrice,
          sellingPrice: products.sellingPrice,
          imageUrl: products.imageUrl,
          isPerishable: products.isPerishable,
          shelfLifeDays: products.shelfLifeDays,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
      })
      .from(aiRecommendations)
      .leftJoin(products, eq(aiRecommendations.productId, products.id))
      .where(and(eq(aiRecommendations.userId, userId), eq(aiRecommendations.isActioned, false)))
      .orderBy(desc(aiRecommendations.createdAt));

    return result as AIRecommendationWithProduct[];
  }

  async createAIRecommendation(recommendation: InsertAIRecommendation & { userId: number }): Promise<AIRecommendation> {
    const [newRecommendation] = await db.insert(aiRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  async updateAIRecommendation(id: number, recommendation: Partial<InsertAIRecommendation>, userId: number): Promise<AIRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(aiRecommendations)
      .set({ ...recommendation, updatedAt: new Date() })
      .where(and(eq(aiRecommendations.id, id), eq(aiRecommendations.userId, userId)))
      .returning();
    return updatedRecommendation;
  }

  async getInventoryHealth(userId: number): Promise<{
    healthy: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  }> {
    const inventoryData = await db
      .select({
        currentStock: inventory.currentStock,
        reorderPoint: inventory.reorderPoint,
        costPrice: products.costPrice,
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.userId, userId));

    let healthy = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    inventoryData.forEach(item => {
      const currentStock = parseFloat(item.currentStock);
      const reorderPoint = parseFloat(item.reorderPoint);
      const costPrice = parseFloat(item.costPrice || '0');

      totalValue += currentStock * costPrice;

      if (currentStock === 0) {
        outOfStock++;
      } else if (currentStock <= reorderPoint) {
        lowStock++;
      } else {
        healthy++;
      }
    });

    return {
      healthy,
      lowStock,
      outOfStock,
      totalValue,
    };
  }

  async getWasteRecords(userId: number): Promise<WasteRecord[]> {
    return await db
      .select()
      .from(wasteRecords)
      .where(eq(wasteRecords.userId, userId))
      .orderBy(desc(wasteRecords.wasteDate));
  }

  async createWasteRecord(record: InsertWasteRecord & { userId: number }): Promise<WasteRecord> {
    const [newRecord] = await db.insert(wasteRecords).values(record).returning();
    return newRecord;
  }

  async getDashboardStats(userId: number): Promise<{
    totalInventoryValue: number;
    itemsExpiringSoon: number;
    outOfStockItems: number;
    monthlySavings: number;
  }> {
    const health = await this.getInventoryHealth(userId);
    
    // Get items expiring soon (within 7 days)
    const expiringItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(
        and(
          eq(inventory.userId, userId),
          sql`${inventory.expirationDate} <= ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}`
        )
      );

    // Calculate monthly savings (mock calculation based on waste reduction)
    const wasteThisMonth = await db
      .select({ totalCost: sql<number>`sum(${wasteRecords.costImpact})` })
      .from(wasteRecords)
      .where(
        and(
          eq(wasteRecords.userId, userId),
          sql`${wasteRecords.wasteDate} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}`
        )
      );

    const monthlySavings = Math.max(0, 3000 - (parseFloat(wasteThisMonth[0]?.totalCost?.toString() || '0')));

    return {
      totalInventoryValue: health.totalValue,
      itemsExpiringSoon: parseInt(expiringItems[0]?.count?.toString() || '0'),
      outOfStockItems: health.outOfStock,
      monthlySavings,
    };
  }

  async getDemandForecast(userId: number, productId?: number): Promise<any[]> {
    const conditions = [eq(demandForecast.userId, userId)];
    if (productId) {
      conditions.push(eq(demandForecast.productId, productId));
    }

    return await db
      .select()
      .from(demandForecast)
      .where(and(...conditions))
      .orderBy(asc(demandForecast.forecastDate));
  }
}

export const storage = new DatabaseStorage();
