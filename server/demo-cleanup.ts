import { db } from "./db";
import { sessions, inventory, products, aiRecommendations, users, wasteRecords, leadMagnetSubmissions } from "@shared/schema";
import { eq, lt, and, ne, sql } from "drizzle-orm";
import { storage } from "./storage";

const DEMO_USER_ID = "1"; // The demo user ID
const PROTECTED_USER_IDS = ["1", "36874920"]; // Demo user and your actual user

export class DemoCleanupService {
  // Clean up old sessions (older than 8 hours)
  async cleanOldSessions() {
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    
    try {
      const result = await db
        .delete(sessions)
        .where(lt(sessions.expire, eightHoursAgo));
      
      console.log(`[Demo Cleanup] Deleted expired sessions`);
      return result;
    } catch (error) {
      console.error("[Demo Cleanup] Error cleaning sessions:", error);
    }
  }

  // Reset demo inventory to default state
  async resetDemoInventory() {
    try {
      // Get current demo products
      const demoProducts = await storage.getProducts(parseInt(DEMO_USER_ID));
      
      // Default inventory values
      const defaultInventory = [
        { name: "Fresh Tomatoes", stock: "15", reorderPoint: "20" },
        { name: "Olive Oil", stock: "25", reorderPoint: "15" },
        { name: "Bread Flour", stock: "0", reorderPoint: "10" },
        { name: "Chicken Breast", stock: "35", reorderPoint: "30" }
      ];

      // Update inventory for demo products
      for (const product of demoProducts) {
        const defaultValue = defaultInventory.find(d => d.name === product.name);
        if (defaultValue) {
          await db
            .update(inventory)
            .set({
              currentStock: defaultValue.stock,
              reorderPoint: defaultValue.reorderPoint,
              lastRestocked: new Date()
            })
            .where(
              and(
                eq(inventory.productId, product.id),
                eq(inventory.userId, parseInt(DEMO_USER_ID))
              )
            );
        }
      }

      console.log("[Demo Cleanup] Reset demo inventory to defaults");
    } catch (error) {
      console.error("[Demo Cleanup] Error resetting inventory:", error);
    }
  }

  // Clean up AI recommendations older than 8 hours
  async cleanOldRecommendations() {
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    
    try {
      await db
        .delete(aiRecommendations)
        .where(
          and(
            eq(aiRecommendations.userId, DEMO_USER_ID),
            lt(aiRecommendations.createdAt, eightHoursAgo)
          )
        );
      
      console.log("[Demo Cleanup] Cleaned old AI recommendations");
    } catch (error) {
      console.error("[Demo Cleanup] Error cleaning recommendations:", error);
    }
  }

  // Clean up lead magnet submissions older than 8 hours
  async cleanOldLeadMagnetSubmissions() {
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    
    try {
      await db
        .delete(leadMagnetSubmissions)
        .where(lt(leadMagnetSubmissions.createdAt, eightHoursAgo));
      
      console.log("[Demo Cleanup] Cleaned old lead magnet submissions");
    } catch (error) {
      console.error("[Demo Cleanup] Error cleaning lead magnet submissions:", error);
    }
  }

  // Clean up any extra products created in demo (keep only the original 4)
  async cleanExtraProducts() {
    try {
      // Get all demo products
      const demoProducts = await storage.getProducts(parseInt(DEMO_USER_ID));
      
      // Keep only the original 4 products
      const originalProductNames = ["Fresh Tomatoes", "Olive Oil", "Bread Flour", "Chicken Breast"];
      
      for (const product of demoProducts) {
        if (!originalProductNames.includes(product.name)) {
          // Delete inventory first
          await db
            .delete(inventory)
            .where(eq(inventory.productId, product.id));
          
          // Then delete the product
          await db
            .delete(products)
            .where(eq(products.id, product.id));
        }
      }
      
      console.log("[Demo Cleanup] Cleaned extra demo products");
    } catch (error) {
      console.error("[Demo Cleanup] Error cleaning extra products:", error);
    }
  }

  // Main cleanup function
  async performCleanup() {
    console.log("[Demo Cleanup] Starting scheduled cleanup...");
    
    await this.cleanOldSessions();
    await this.resetDemoInventory();
    await this.cleanOldRecommendations();
    await this.cleanOldLeadMagnetSubmissions();
    await this.cleanExtraProducts();
    
    console.log("[Demo Cleanup] Cleanup completed successfully");
  }
}

export const demoCleanupService = new DemoCleanupService();