import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertInventorySchema, insertSupplierSchema, insertAiRecommendationSchema, insertWasteRecordSchema, insertFeedbackSchema, insertAchievementSchema, insertUserStatsSchema, achievements } from "@shared/schema";
import { z } from "zod";
import { aiAssistant } from "./ai-assistant";
import { db } from "./db";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth middleware
  await setupAuth(app);
  
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Ensure user can only update their own profile
      if (userId !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updateData = req.body;
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Mock user ID for demo purposes (in production, get from auth)
  const MOCK_USER_ID = "1";

  // Initialize demo data
  app.post("/api/init-demo", async (req, res) => {
    try {
      // Create demo user with proper ID
      await storage.createUser({
        id: "1",
        email: "demo@stocksense.com",
        firstName: "John",
        lastName: "Martinez",
        businessType: "restaurant",
      });

      // Create demo products and inventory
      const products = [
        {
          name: "Fresh Tomatoes",
          description: "Organic fresh tomatoes",
          unit: "lbs",
          costPrice: "3.50",
          sellingPrice: "5.00",
          imageUrl: "https://images.unsplash.com/photo-1546470427-e212b9ee8f32?w=100&h=100&fit=crop",
          isPerishable: true,
          shelfLifeDays: 7,
          userId: MOCK_USER_ID,
        },
        {
          name: "Extra Virgin Olive Oil",
          description: "Premium olive oil",
          unit: "bottles",
          costPrice: "8.00",
          sellingPrice: "12.00",
          imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop",
          isPerishable: false,
          userId: MOCK_USER_ID,
        },
        {
          name: "Bread Flour",
          description: "All-purpose bread flour",
          unit: "lbs",
          costPrice: "2.50",
          sellingPrice: "4.00",
          imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop",
          isPerishable: false,
          userId: MOCK_USER_ID,
        },
        {
          name: "Chicken Breast",
          description: "Fresh chicken breast",
          unit: "lbs",
          costPrice: "6.00",
          sellingPrice: "10.00",
          imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&h=100&fit=crop",
          isPerishable: true,
          shelfLifeDays: 5,
          userId: MOCK_USER_ID,
        },
      ];

      for (const product of products) {
        const createdProduct = await storage.createProduct(product);
        
        // Create inventory for each product
        const inventoryData = {
          productId: createdProduct.id,
          userId: MOCK_USER_ID,
          currentStock: product.name === "Bread Flour" ? "0" : 
                       product.name === "Fresh Tomatoes" ? "15" :
                       product.name === "Extra Virgin Olive Oil" ? "12" : "35",
          reorderPoint: product.name === "Bread Flour" ? "50" :
                       product.name === "Fresh Tomatoes" ? "25" :
                       product.name === "Extra Virgin Olive Oil" ? "6" : "20",
          maxStock: "100",
          lastRestocked: new Date(),
          expirationDate: product.isPerishable ? new Date(Date.now() + (product.shelfLifeDays || 7) * 24 * 60 * 60 * 1000) : null,
        };
        
        await storage.createInventoryItem(inventoryData);
      }

      // Create AI recommendations
      const recommendations = [
        {
          productId: 1, // Fresh Tomatoes
          type: "reorder",
          priority: "high",
          message: "Current stock will last 2 days. Recommended order: 50 lbs",
          confidence: "0.87",
          recommendedAction: "Order Now",
          quantityRecommended: "50",
          userId: MOCK_USER_ID,
        },
        {
          productId: 2, // Olive Oil
          type: "promotion",
          priority: "medium",
          message: "12 bottles expiring in 5 days. Suggest 15% discount promotion",
          confidence: "0.73",
          recommendedAction: "Create Promo",
          quantityRecommended: "12",
          userId: MOCK_USER_ID,
        },
        {
          productId: 3, // Bread Flour
          type: "emergency",
          priority: "critical",
          message: "Out of stock. Peak demand detected. Emergency supplier suggested",
          confidence: "0.95",
          recommendedAction: "Emergency Order",
          quantityRecommended: "100",
          userId: MOCK_USER_ID,
        },
      ];

      for (const rec of recommendations) {
        await storage.createAIRecommendation(rec);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error initializing demo:", error);
      res.status(500).json({ error: "Failed to initialize demo data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(MOCK_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Inventory health
  app.get("/api/inventory/health", async (req, res) => {
    try {
      const health = await storage.getInventoryHealth(MOCK_USER_ID);
      res.json(health);
    } catch (error) {
      console.error("Error fetching inventory health:", error);
      res.status(500).json({ error: "Failed to fetch inventory health" });
    }
  });

  // AI recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getAIRecommendations(MOCK_USER_ID);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Update recommendation (mark as actioned)
  app.patch("/api/recommendations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActioned } = req.body;
      
      const updated = await storage.updateAIRecommendation(id, { isActioned }, MOCK_USER_ID);
      
      if (!updated) {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      res.status(500).json({ error: "Failed to update recommendation" });
    }
  });

  // Inventory list
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory(MOCK_USER_ID);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Inventory Health Score
  app.get("/api/inventory/health-score", async (req, res) => {
    try {
      const inventory = await storage.getInventory(MOCK_USER_ID);
      
      // Calculate metrics
      let stockAccuracy = 85;
      let wastageRate = 70;
      let stockoutFrequency = 75;
      let reorderEfficiency = 80;
      
      // Calculate based on actual data
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter((item: any) => item.currentStock <= item.reorderPoint).length;
      const outOfStockItems = inventory.filter((item: any) => item.currentStock === 0).length;
      
      stockoutFrequency = Math.max(0, 100 - (outOfStockItems / totalItems) * 100);
      reorderEfficiency = Math.max(0, 100 - (lowStockItems / totalItems) * 50);
      
      // Overall score is weighted average
      const overallScore = Math.round(
        (stockAccuracy * 0.3) +
        (wastageRate * 0.2) +
        (stockoutFrequency * 0.3) +
        (reorderEfficiency * 0.2)
      );
      
      res.json({
        stockAccuracy,
        wastageRate,
        stockoutFrequency,
        reorderEfficiency,
        overallScore
      });
    } catch (error) {
      console.error("Error calculating health score:", error);
      res.status(500).json({ error: "Failed to calculate health score" });
    }
  });

  // Fix Actions
  app.get("/api/inventory/fix-actions", async (req, res) => {
    try {
      const inventory = await storage.getInventory(MOCK_USER_ID);
      const actions = [];
      
      // Find critical stock items
      const criticalItems = inventory
        .filter((item: any) => item.currentStock <= item.reorderPoint && item.currentStock > 0)
        .slice(0, 3);
      
      criticalItems.forEach((item: any) => {
        actions.push({
          priority: item.currentStock <= 5 ? 'high' : 'medium',
          action: `Reorder ${item.product.name} - Only ${item.currentStock} units left`,
          impact: 'Prevent stockout and lost sales',
          emoji: '📦'
        });
      });
      
      // Add waste reduction action
      actions.push({
        priority: 'medium',
        action: 'Review expiring items and create promotions',
        impact: 'Reduce waste by 15-20%',
        emoji: '♻️'
      });
      
      // Add optimization action
      actions.push({
        priority: 'low',
        action: 'Update seasonal item reorder points',
        impact: 'Optimize inventory levels',
        emoji: '📊'
      });
      
      res.json(actions.slice(0, 5));
    } catch (error) {
      console.error("Error generating fix actions:", error);
      res.status(500).json({ error: "Failed to generate fix actions" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers(MOCK_USER_ID);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  // Demand forecast data
  app.get("/api/analytics/demand-forecast", async (req, res) => {
    try {
      // Mock demand forecast data
      const mockData = [
        { month: 'Jan', actual: 65, predicted: 60 },
        { month: 'Feb', actual: 59, predicted: 55 },
        { month: 'Mar', actual: 80, predicted: 85 },
        { month: 'Apr', actual: 81, predicted: 78 },
        { month: 'May', actual: 56, predicted: 62 },
        { month: 'Jun', actual: 55, predicted: 58 },
        { month: 'Jul', actual: 40, predicted: 45 },
      ];
      
      res.json(mockData);
    } catch (error) {
      console.error("Error fetching demand forecast:", error);
      res.status(500).json({ error: "Failed to fetch demand forecast" });
    }
  });

  // Waste analysis data
  app.get("/api/analytics/waste-analysis", async (req, res) => {
    try {
      // Mock waste analysis data
      const mockData = [
        { category: 'Saved', value: 70, color: '#4CAF50' },
        { category: 'Spoiled', value: 20, color: '#F44336' },
        { category: 'Discounted', value: 10, color: '#FF9800' },
      ];
      
      res.json(mockData);
    } catch (error) {
      console.error("Error fetching waste analysis:", error);
      res.status(500).json({ error: "Failed to fetch waste analysis" });
    }
  });

  // Supplier performance data
  app.get("/api/suppliers/performance", async (req, res) => {
    try {
      // Mock supplier performance data
      const mockData = [
        {
          name: "FreshCorp Produce",
          grade: "A+",
          deliveryRate: 98,
          avgLeadTime: 1.2,
          qualityScore: 9.4,
        },
        {
          name: "Metro Food Service",
          grade: "B",
          deliveryRate: 87,
          avgLeadTime: 2.1,
          qualityScore: 7.8,
        },
        {
          name: "QuickStock Solutions",
          grade: "C",
          deliveryRate: 72,
          avgLeadTime: 3.8,
          qualityScore: 6.1,
        },
      ];
      
      res.json(mockData);
    } catch (error) {
      console.error("Error fetching supplier performance:", error);
      res.status(500).json({ error: "Failed to fetch supplier performance" });
    }
  });

  // POS Integration routes
  app.get('/api/pos/sync-stats', async (req, res) => {
    try {
      const stats = {
        totalTransactions: 2106,
        itemsSynced: 147,
        lastSyncMinutes: 2,
        connectedSystems: 2,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching POS sync stats:", error);
      res.status(500).json({ message: "Failed to fetch sync stats" });
    }
  });

  app.post('/api/pos/:posId/sync', async (req, res) => {
    try {
      const { posId } = req.params;
      
      // Simulate POS sync with realistic data
      const syncResults = {
        square: { itemsUpdated: 23, newItems: 3, updatedPrices: 8 },
        shopify: { itemsUpdated: 15, newItems: 2, updatedPrices: 5 },
        toast: { itemsUpdated: 31, newItems: 5, updatedPrices: 12 },
        lightspeed: { itemsUpdated: 19, newItems: 1, updatedPrices: 7 },
      };
      
      const result = syncResults[posId as keyof typeof syncResults] || { itemsUpdated: 0, newItems: 0, updatedPrices: 0 };
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json(result);
    } catch (error) {
      console.error("Error syncing POS:", error);
      res.status(500).json({ message: "Failed to sync POS system" });
    }
  });

  app.post('/api/pos/:posId/connect', async (req, res) => {
    try {
      const { posId } = req.params;
      const { apiKey, storeId, environment } = req.body;
      
      // Simulate connection validation
      if (!apiKey || !storeId) {
        return res.status(400).json({ message: "API key and store ID are required" });
      }
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({ 
        success: true, 
        message: `Successfully connected to ${posId}`,
        connectionId: `conn_${posId}_${Date.now()}`
      });
    } catch (error) {
      console.error("Error connecting POS:", error);
      res.status(500).json({ message: "Failed to connect POS system" });
    }
  });

  // Category routes for the product form
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      // If no categories exist, create some default ones
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Produce", description: "Fresh fruits and vegetables" },
          { name: "Dairy", description: "Milk, cheese, and dairy products" },
          { name: "Meat", description: "Fresh meat and seafood" },
          { name: "Pantry", description: "Dry goods and shelf-stable items" },
          { name: "Beverages", description: "Drinks and liquid refreshments" },
          { name: "Frozen", description: "Frozen foods and ice cream" },
        ];
        
        for (const cat of defaultCategories) {
          await storage.createCategory(cat);
        }
        
        const newCategories = await storage.getCategories();
        res.json(newCategories);
      } else {
        res.json(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      const category = await storage.createCategory({ name, description });
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // AI Assistant Routes
  app.get('/api/ai/recommendations', async (req, res) => {
    try {
      const recommendations = await aiAssistant.generateProactiveRecommendations(MOCK_USER_ID);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get('/api/ai/insights/:productId', async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const insights = await aiAssistant.analyzeInventoryTrends(MOCK_USER_ID, productId);
      res.json(insights);
    } catch (error) {
      console.error("Error analyzing inventory trends:", error);
      res.status(500).json({ message: "Failed to analyze trends" });
    }
  });

  app.get('/api/ai/report', async (req, res) => {
    try {
      const report = await aiAssistant.generateInventoryReport(MOCK_USER_ID);
      res.json({ report });
    } catch (error) {
      console.error("Error generating inventory report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.post('/api/ai/optimize-reorder', async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }
      
      const recommendations = await aiAssistant.optimizeReorderQuantities(MOCK_USER_ID, productIds);
      res.json(recommendations);
    } catch (error) {
      console.error("Error optimizing reorder quantities:", error);
      res.status(500).json({ message: "Failed to optimize quantities" });
    }
  });

  // Feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID,
      });
      
      const feedback = await storage.createFeedback(validatedData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // Get user feedback
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getFeedback(MOCK_USER_ID);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Achievement system routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  app.get("/api/achievements/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userStats = await storage.getUserStats(userId);
      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.post("/api/achievements/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const statsUpdate = req.body;
      const updatedStats = await storage.updateUserStats(userId, statsUpdate);
      
      // Check for new achievements
      const newAchievements = await storage.checkAndUpdateAchievements(userId);
      
      res.json({ 
        stats: updatedStats,
        newAchievements,
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ error: "Failed to update user stats" });
    }
  });

  app.post("/api/achievements/check/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const completedAchievements = await storage.checkAndUpdateAchievements(userId);
      res.json(completedAchievements);
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Spoilage prediction routes
  app.get("/api/spoilage/risks", async (req, res) => {
    try {
      const risks = await storage.getSpoilageRisks(parseInt(MOCK_USER_ID));
      res.json(risks);
    } catch (error) {
      console.error("Error fetching spoilage risks:", error);
      res.status(500).json({ error: "Failed to fetch spoilage risks" });
    }
  });

  app.put("/api/spoilage/storage-conditions/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const { conditions } = req.body;
      
      await storage.updateStorageConditions(parseInt(productId), conditions, parseInt(MOCK_USER_ID));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating storage conditions:", error);
      res.status(500).json({ error: "Failed to update storage conditions" });
    }
  });

  app.get("/api/spoilage/predictions", async (req, res) => {
    try {
      const { spoilagePredictor } = await import('./spoilage-predictor');
      const predictions = await spoilagePredictor.generateAdvancedPredictions(parseInt(MOCK_USER_ID));
      res.json(predictions);
    } catch (error) {
      console.error("Error generating spoilage predictions:", error);
      res.status(500).json({ error: "Failed to generate spoilage predictions" });
    }
  });

  // Initialize achievements
  app.post("/api/achievements/init", async (req, res) => {
    try {
      const MOCK_USER_ID = "1";
      
      // Initialize achievements if not exists
      const existingAchievements = await storage.getAchievements();
      if (existingAchievements.length === 0) {
        const demoAchievements = [
          {
            name: "First Steps",
            description: "Complete your first inventory check",
            icon: "target",
            category: "milestone",
            points: 50,
            requirement: { type: "inventory_check", target: 1 },
            isActive: true,
          },
          {
            name: "Zero Waste Warrior",
            description: "Achieve 7 consecutive days with no inventory waste",
            icon: "shield",
            category: "waste_reduction",
            points: 200,
            requirement: { type: "waste_free_days", target: 7 },
            isActive: true,
          },
          {
            name: "Forecast Master",
            description: "Make 10 accurate demand predictions",
            icon: "trending-up",
            category: "forecasting",
            points: 150,
            requirement: { type: "accurate_predictions", target: 10 },
            isActive: true,
          },
          {
            name: "Inventory Optimizer",
            description: "Maintain optimal stock levels for 30 days",
            icon: "package",
            category: "inventory",
            points: 300,
            requirement: { type: "optimal_stock_days", target: 30 },
            isActive: true,
          },
          {
            name: "Streak Champion",
            description: "Log inventory updates for 14 consecutive days",
            icon: "zap",
            category: "streak",
            points: 250,
            requirement: { type: "daily_streak", target: 14 },
            isActive: true,
          },
          {
            name: "Efficiency Expert",
            description: "Reduce inventory processing time by 50%",
            icon: "star",
            category: "efficiency",
            points: 400,
            requirement: { type: "processing_time_reduction", target: 50 },
            isActive: true,
          },
          {
            name: "Waste Reduction Hero",
            description: "Achieve 30 consecutive days with no waste",
            icon: "shield-check",
            category: "waste_reduction",
            points: 500,
            requirement: { type: "waste_free_days", target: 30 },
            isActive: true,
          },
          {
            name: "Prediction Pro",
            description: "Achieve 95% accuracy in demand forecasting",
            icon: "trending-up",
            category: "forecasting",
            points: 600,
            requirement: { type: "prediction_accuracy", target: 95 },
            isActive: true,
          },
        ];

        for (const achievement of demoAchievements) {
          await db.insert(achievements).values(achievement);
        }
      }

      // Initialize user stats
      const userStats = await storage.getUserStats(MOCK_USER_ID);
      if (!userStats) {
        await storage.updateUserStats(MOCK_USER_ID, {
          wasteFreeDays: 3,
          accuratePredictions: 2,
          optimalStockDays: 5,
          currentStreak: 3,
          longestStreak: 5,
        });
      }

      res.json({ message: "Achievements initialized successfully" });
    } catch (error) {
      console.error("Error initializing achievements:", error);
      res.status(500).json({ error: "Failed to initialize achievements" });
    }
  });

  // Storage conditions tracking
  app.get("/api/storage-conditions/:productId", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const conditions = await storage.getStorageConditions(parseInt(productId));
      res.json(conditions);
    } catch (error) {
      console.error("Error getting storage conditions:", error);
      res.status(500).json({ message: "Failed to get storage conditions" });
    }
  });

  app.post("/api/storage-conditions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const conditionData = {
        ...req.body,
        recordedBy: userId,
      };
      const condition = await storage.createStorageCondition(conditionData);
      res.json(condition);
    } catch (error) {
      console.error("Error creating storage condition:", error);
      res.status(500).json({ message: "Failed to create storage condition" });
    }
  });

  // Critical alerts
  app.get("/api/critical-alerts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const alerts = await storage.getCriticalAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error getting critical alerts:", error);
      res.status(500).json({ message: "Failed to get critical alerts" });
    }
  });

  app.post("/api/critical-alerts", isAuthenticated, async (req, res) => {
    try {
      const alert = await storage.createCriticalAlert(req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error creating critical alert:", error);
      res.status(500).json({ message: "Failed to create critical alert" });
    }
  });

  app.put("/api/critical-alerts/:id/resolve", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const alert = await storage.resolveCriticalAlert(parseInt(id), userId);
      res.json(alert);
    } catch (error) {
      console.error("Error resolving critical alert:", error);
      res.status(500).json({ message: "Failed to resolve critical alert" });
    }
  });

  // Batch processing
  app.post("/api/batch-jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobData = {
        ...req.body,
        createdBy: userId,
      };
      const job = await storage.createBatchJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating batch job:", error);
      res.status(500).json({ message: "Failed to create batch job" });
    }
  });

  app.get("/api/batch-jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobs = await storage.getBatchJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error getting batch jobs:", error);
      res.status(500).json({ message: "Failed to get batch jobs" });
    }
  });

  app.get("/api/batch-jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getBatchJob(parseInt(id));
      res.json(job);
    } catch (error) {
      console.error("Error getting batch job:", error);
      res.status(500).json({ message: "Failed to get batch job" });
    }
  });

  app.post("/api/batch-jobs/:id/start", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.startBatchJob(parseInt(id));
      res.json(job);
    } catch (error) {
      console.error("Error starting batch job:", error);
      res.status(500).json({ message: "Failed to start batch job" });
    }
  });

  // Lead Magnet Calculator routes
  app.post("/api/lead-magnet/calculate", async (req, res) => {
    try {
      const { email, businessName, monthlyInventoryValue, currentWastePercentage, industry } = req.body;
      
      // Calculate potential savings
      const monthlySavings = monthlyInventoryValue * (currentWastePercentage / 100) * 0.6; // 60% reduction
      const annualSavings = monthlySavings * 12;
      const wasteReduction = Math.min(currentWastePercentage * 0.6, 30); // Up to 30% reduction
      const profitIncrease = (monthlySavings / monthlyInventoryValue) * 100;

      // Save submission
      const submission = await storage.createLeadMagnetSubmission({
        email,
        businessName,
        monthlyInventoryValue: monthlyInventoryValue.toString(),
        currentWastePercentage: currentWastePercentage.toString(),
        calculatedSavings: monthlySavings.toString(),
        industry,
      });

      res.json({
        monthlySavings: Math.round(monthlySavings),
        annualSavings: Math.round(annualSavings),
        wasteReduction: Math.round(wasteReduction),
        profitIncrease: Math.round(profitIncrease * 100) / 100,
        submissionId: submission.id,
      });
    } catch (error) {
      console.error("Error calculating savings:", error);
      res.status(500).json({ error: "Failed to calculate savings" });
    }
  });

  // Supplier Marketplace routes
  app.get("/api/suppliers/marketplace", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSupplierMarketplace();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching supplier marketplace:", error);
      res.status(500).json({ error: "Failed to fetch supplier marketplace" });
    }
  });

  app.post("/api/suppliers/marketplace", isAuthenticated, async (req, res) => {
    try {
      const marketplaceData = req.body;
      const marketplace = await storage.createSupplierMarketplace(marketplaceData);
      res.json(marketplace);
    } catch (error) {
      console.error("Error creating supplier marketplace profile:", error);
      res.status(500).json({ error: "Failed to create marketplace profile" });
    }
  });

  // Supplier Price Comparison routes
  app.get("/api/supplier-prices", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.query;
      const prices = await storage.getSupplierPrices(productId ? parseInt(productId as string) : undefined);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching supplier prices:", error);
      res.status(500).json({ error: "Failed to fetch supplier prices" });
    }
  });

  app.post("/api/supplier-prices", isAuthenticated, async (req, res) => {
    try {
      const priceData = req.body;
      const price = await storage.createSupplierPrice(priceData);
      res.json(price);
    } catch (error) {
      console.error("Error creating supplier price:", error);
      res.status(500).json({ error: "Failed to create supplier price" });
    }
  });

  // Referral Program routes
  app.get("/api/referrals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const referrals = await storage.getReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.post("/api/referrals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { refereeEmail } = req.body;
      
      // Generate unique referral code
      const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const referral = await storage.createReferral({
        referrerId: userId,
        refereeEmail,
        referralCode,
        rewardAmount: "50.00",
        rewardType: "credit",
      });

      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ error: "Failed to create referral" });
    }
  });

  app.get("/api/referrals/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const stats = await storage.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ error: "Failed to fetch referral stats" });
    }
  });

  // Supplier Review routes
  app.post("/api/supplier-reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const reviewData = { ...req.body, reviewerId: userId };
      const review = await storage.createSupplierReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating supplier review:", error);
      res.status(500).json({ error: "Failed to create supplier review" });
    }
  });

  app.get("/api/supplier-reviews/:supplierId", isAuthenticated, async (req, res) => {
    try {
      const { supplierId } = req.params;
      const reviews = await storage.getSupplierReviews(parseInt(supplierId));
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching supplier reviews:", error);
      res.status(500).json({ error: "Failed to fetch supplier reviews" });
    }
  });

  app.get("/api/user-reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  });

  // Automated Purchase Order routes
  app.post("/api/purchase-orders/automated", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const orderData = { ...req.body, createdBy: userId };
      const order = await storage.createAutomatedPurchaseOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating automated purchase order:", error);
      res.status(500).json({ error: "Failed to create automated purchase order" });
    }
  });

  app.get("/api/purchase-orders/automated", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getAutomatedPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching automated purchase orders:", error);
      res.status(500).json({ error: "Failed to fetch automated purchase orders" });
    }
  });

  app.patch("/api/purchase-orders/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.approvePurchaseOrder(parseInt(id));
      res.json(order);
    } catch (error) {
      console.error("Error approving purchase order:", error);
      res.status(500).json({ error: "Failed to approve purchase order" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      // Return sample notifications for now
      const notifications = [
        {
          id: "1",
          type: "critical",
          title: "Critical Stock Alert",
          message: "Fresh Tomatoes are critically low (5 units remaining)",
          emoji: "🍅",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          actionable: true,
          action: "Reorder Now",
          actionUrl: "/inventory",
          category: "alerts",
          priority: "critical"
        },
        {
          id: "2",
          type: "warning",
          title: "Items Expiring Soon",
          message: "3 items will expire within 2 days",
          emoji: "⏰",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          actionable: true,
          action: "View Items",
          actionUrl: "/spoilage",
          category: "alerts",
          priority: "high"
        },
        {
          id: "3",
          type: "success",
          title: "Order Delivered",
          message: "Your order from FreshCorp Produce has been delivered",
          emoji: "📦",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: true,
          actionable: false,
          category: "orders",
          priority: "medium"
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        total: 5,
        unread: 3,
        critical: 1
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      res.status(500).json({ error: "Failed to fetch notification stats" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // In a real app, you would update the notification in the database
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", isAuthenticated, async (req, res) => {
    try {
      // In a real app, you would mark all notifications as read in the database
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // In a real app, you would delete the notification from the database
      res.json({ success: true });
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ error: "Failed to dismiss notification" });
    }
  });

  // Supplier connection routes
  app.post("/api/suppliers/connect", isAuthenticated, async (req, res) => {
    try {
      const { supplierId } = req.body;
      const userId = req.user?.claims?.sub;
      
      // In a real app, you would create a connection record in the database
      const connection = {
        id: Date.now(),
        userId,
        supplierId,
        status: "connected",
        connectedAt: new Date(),
        autoReorderEnabled: true,
        specialPricing: true
      };
      
      res.json(connection);
    } catch (error) {
      console.error("Error connecting supplier:", error);
      res.status(500).json({ error: "Failed to connect supplier" });
    }
  });

  app.post("/api/suppliers/:id/disconnect", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      
      // In a real app, you would update the connection status in the database
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting supplier:", error);
      res.status(500).json({ error: "Failed to disconnect supplier" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
