import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertInventorySchema, insertSupplierSchema, insertAiRecommendationSchema, insertWasteRecordSchema, insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import { aiAssistant } from "./ai-assistant";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo purposes (in production, get from auth)
  const MOCK_USER_ID = 1;

  // Initialize demo data
  app.post("/api/init-demo", async (req, res) => {
    try {
      // Create demo user
      await storage.createUser({
        username: "demo",
        email: "demo@stocksense.com",
        password: "demo123",
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

  const httpServer = createServer(app);
  return httpServer;
}
