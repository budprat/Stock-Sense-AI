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
  feedback,
  achievements,
  userAchievements,
  userStats,
  storageConditions,
  criticalAlerts,
  batchJobs,
  type User,
  type UpsertUser,
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
  type Category,
  type InsertCategory,
  type Feedback,
  type InsertFeedback,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type UserStats,
  type InsertUserStats,
  type AchievementWithProgress,
  type StorageCondition,
  type InsertStorageCondition,
  type CriticalAlert,
  type InsertCriticalAlert,
  type BatchJob,
  type InsertBatchJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser?(user: any): Promise<User>;

  // Product operations
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number, userId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { userId: number }): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, userId: number): Promise<Product | undefined>;
  deleteProduct(id: number, userId: number): Promise<boolean>;

  // Inventory operations
  getInventory(userId: number): Promise<InventoryWithProduct[]>;
  getInventoryItem(productId: number, userId: number): Promise<InventoryWithProduct | undefined>;
  getInventoryByProduct(userId: number, productId: number): Promise<Inventory | undefined>;
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
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(userId: number): Promise<Feedback[]>;

  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<AchievementWithProgress[]>;
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;
  updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement>;
  completeAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  checkAndUpdateAchievements(userId: string): Promise<Achievement[]>;

  // Spoilage prediction operations
  getSpoilageRisks(userId: number): Promise<any[]>;
  updateStorageConditions(productId: number, conditions: any, userId: number): Promise<void>;

  // Storage conditions tracking
  getStorageConditions(productId: number): Promise<StorageCondition[]>;
  createStorageCondition(condition: InsertStorageCondition): Promise<StorageCondition>;
  updateStorageCondition(id: number, condition: Partial<StorageCondition>): Promise<StorageCondition>;

  // Critical alerts
  getCriticalAlerts(userId: string): Promise<CriticalAlert[]>;
  createCriticalAlert(alert: InsertCriticalAlert): Promise<CriticalAlert>;
  resolveCriticalAlert(id: number, userId: string): Promise<CriticalAlert>;

  // Batch processing
  getBatchJobs(userId: string): Promise<BatchJob[]>;
  getBatchJob(id: number): Promise<BatchJob | undefined>;
  createBatchJob(job: InsertBatchJob): Promise<BatchJob>;
  updateBatchJob(id: number, job: Partial<BatchJob>): Promise<BatchJob>;
  startBatchJob(id: number): Promise<BatchJob>;
  completeBatchJob(id: number, results: any): Promise<BatchJob>;
  failBatchJob(id: number, errors: string[]): Promise<BatchJob>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Legacy createUser method for backward compatibility
  async createUser(userData: any): Promise<User> {
    return this.upsertUser(userData);
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
    return (result.rowCount || 0) > 0;
  }

  async getInventory(userId: number): Promise<InventoryWithProduct[]> {
    const result = await db
      .select()
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(inventory.userId, userId))
      .orderBy(asc(products.name));

    return result.map(row => ({
      ...row.inventory,
      product: {
        ...row.products!,
        category: row.categories || null
      }
    })) as InventoryWithProduct[];
  }

  async getInventoryItem(productId: number, userId: number): Promise<InventoryWithProduct | undefined> {
    const [result] = await db
      .select()
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(inventory.productId, productId), eq(inventory.userId, userId)));

    if (!result) return undefined;

    return {
      ...result.inventory,
      product: {
        ...result.products!,
        category: result.categories || null
      }
    } as InventoryWithProduct;
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

  async getInventoryByProduct(userId: number, productId: number): Promise<Inventory | undefined> {
    const [item] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.userId, userId), eq(inventory.productId, productId)));
    return item;
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

  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getFeedback(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(asc(achievements.category), asc(achievements.name));
  }

  async getUserAchievements(userId: string): Promise<AchievementWithProgress[]> {
    const result = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        category: achievements.category,
        points: achievements.points,
        requirement: achievements.requirement,
        isActive: achievements.isActive,
        createdAt: achievements.createdAt,
        progress: userAchievements.progress,
        isCompleted: userAchievements.isCompleted,
        completedAt: userAchievements.completedAt,
      })
      .from(achievements)
      .leftJoin(userAchievements, and(
        eq(achievements.id, userAchievements.achievementId),
        eq(userAchievements.userId, userId)
      ))
      .where(eq(achievements.isActive, true))
      .orderBy(asc(achievements.category), asc(achievements.name));

    return result.map(row => ({
      ...row,
      progress: row.progress || 0,
      isCompleted: row.isCompleted || false,
      completedAt: row.completedAt || undefined,
    }));
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    if (!stats) {
      // Create initial stats for new user
      const [newStats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();
      return newStats;
    }

    return stats;
  }

  async updateUserStats(userId: string, statsUpdate: Partial<UserStats>): Promise<UserStats> {
    const [stats] = await db
      .update(userStats)
      .set({ ...statsUpdate, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();

    return stats;
  }

  async updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement> {
    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    if (existing.length === 0) {
      const [newAchievement] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          progress,
        })
        .returning();
      return newAchievement;
    } else {
      const [updatedAchievement] = await db
        .update(userAchievements)
        .set({ progress })
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        ))
        .returning();
      return updatedAchievement;
    }
  }

  async completeAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [completedAchievement] = await db
      .update(userAchievements)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ))
      .returning();

    // Update user stats
    const currentStats = await this.getUserStats(userId);
    if (currentStats) {
      await this.updateUserStats(userId, {
        totalAchievements: currentStats.totalAchievements + 1,
        totalPoints: currentStats.totalPoints + (await this.getAchievementPoints(achievementId)),
      });
    }

    return completedAchievement;
  }

  async checkAndUpdateAchievements(userId: string): Promise<Achievement[]> {
    const stats = await this.getUserStats(userId);
    const userAchievements = await this.getUserAchievements(userId);
    const completedAchievements: Achievement[] = [];

    // Check each achievement type
    for (const achievement of userAchievements) {
      if (achievement.isCompleted) continue;

      let shouldComplete = false;
      const requirement = achievement.requirement as any;

      switch (achievement.category) {
        case 'waste_reduction':
          if (requirement.type === 'waste_free_days' && stats && stats.wasteFreeDays >= requirement.target) {
            shouldComplete = true;
          }
          break;
        case 'forecasting':
          if (requirement.type === 'accurate_predictions' && stats && stats.accuratePredictions >= requirement.target) {
            shouldComplete = true;
          }
          break;
        case 'inventory':
          if (requirement.type === 'optimal_stock_days' && stats && stats.optimalStockDays >= requirement.target) {
            shouldComplete = true;
          }
          break;
        case 'streak':
          if (requirement.type === 'daily_streak' && stats && stats.currentStreak >= requirement.target) {
            shouldComplete = true;
          }
          break;
      }

      if (shouldComplete) {
        await this.completeAchievement(userId, achievement.id);
        completedAchievements.push(achievement);
      }
    }

    return completedAchievements;
  }

  private async getAchievementPoints(achievementId: number): Promise<number> {
    const [achievement] = await db
      .select({ points: achievements.points })
      .from(achievements)
      .where(eq(achievements.id, achievementId));
    return achievement?.points || 100;
  }

  // Spoilage prediction operations
  async getSpoilageRisks(userId: number): Promise<any[]> {
    const { spoilagePredictor } = await import('./spoilage-predictor');
    return await spoilagePredictor.predictSpoilageRisks(userId);
  }

  async updateStorageConditions(productId: number, conditions: any, userId: number): Promise<void> {
    // TODO: Implement when storage_conditions column is available
    console.log('Storage conditions update requested for product:', productId);
  }

  // Storage conditions tracking
  async getStorageConditions(productId: number): Promise<StorageCondition[]> {
    const conditions = await db
      .select()
      .from(storageConditions)
      .where(eq(storageConditions.productId, productId))
      .orderBy(desc(storageConditions.recordedAt));
    return conditions;
  }

  async createStorageCondition(condition: InsertStorageCondition): Promise<StorageCondition> {
    const [newCondition] = await db
      .insert(storageConditions)
      .values(condition)
      .returning();
    return newCondition;
  }

  async updateStorageCondition(id: number, condition: Partial<StorageCondition>): Promise<StorageCondition> {
    const [updatedCondition] = await db
      .update(storageConditions)
      .set(condition)
      .where(eq(storageConditions.id, id))
      .returning();
    return updatedCondition;
  }

  // Critical alerts
  async getCriticalAlerts(userId: string): Promise<CriticalAlert[]> {
    const alerts = await db
      .select()
      .from(criticalAlerts)
      .where(eq(criticalAlerts.isResolved, false))
      .orderBy(desc(criticalAlerts.createdAt), desc(criticalAlerts.severity));
    return alerts;
  }

  async createCriticalAlert(alert: InsertCriticalAlert): Promise<CriticalAlert> {
    const [newAlert] = await db
      .insert(criticalAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async resolveCriticalAlert(id: number, userId: string): Promise<CriticalAlert> {
    const [resolvedAlert] = await db
      .update(criticalAlerts)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(criticalAlerts.id, id))
      .returning();
    return resolvedAlert;
  }

  // Batch processing
  async getBatchJobs(userId: string): Promise<BatchJob[]> {
    const jobs = await db
      .select()
      .from(batchJobs)
      .where(eq(batchJobs.createdBy, userId))
      .orderBy(desc(batchJobs.createdAt));
    return jobs;
  }

  async getBatchJob(id: number): Promise<BatchJob | undefined> {
    const [job] = await db
      .select()
      .from(batchJobs)
      .where(eq(batchJobs.id, id));
    return job;
  }

  async createBatchJob(job: InsertBatchJob): Promise<BatchJob> {
    const [newJob] = await db
      .insert(batchJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateBatchJob(id: number, job: Partial<BatchJob>): Promise<BatchJob> {
    const [updatedJob] = await db
      .update(batchJobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(batchJobs.id, id))
      .returning();
    return updatedJob;
  }

  async startBatchJob(id: number): Promise<BatchJob> {
    const [startedJob] = await db
      .update(batchJobs)
      .set({
        status: 'running',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(batchJobs.id, id))
      .returning();
    return startedJob;
  }

  async completeBatchJob(id: number, results: any): Promise<BatchJob> {
    const [completedJob] = await db
      .update(batchJobs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        results,
        updatedAt: new Date(),
      })
      .where(eq(batchJobs.id, id))
      .returning();
    return completedJob;
  }

  async failBatchJob(id: number, errors: string[]): Promise<BatchJob> {
    const [failedJob] = await db
      .update(batchJobs)
      .set({
        status: 'failed',
        errors,
        updatedAt: new Date(),
      })
      .where(eq(batchJobs.id, id))
      .returning();
    return failedJob;
  }
}

export const storage = new DatabaseStorage();
