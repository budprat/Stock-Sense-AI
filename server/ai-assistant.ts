import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import type { Product, Inventory } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIRecommendation {
  id: string;
  type: 'reorder' | 'waste_alert' | 'optimization' | 'seasonal' | 'supplier';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number;
  category: string;
  productId?: number;
  supplierId?: number;
  quantityRecommended?: number;
  costSavings?: number;
  timestamp: Date;
}

export interface InventoryInsight {
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export class AIInventoryAssistant {
  private model = ai.models.generateContent;

  async generateProactiveRecommendations(userId: number): Promise<AIRecommendation[]> {
    try {
      // Get current inventory data
      const inventory = await storage.getInventory(userId);
      const products = await storage.getProducts(userId);
      
      if (!inventory || !products) {
        return [];
      }

      // Prepare data for AI analysis
      const inventoryData = inventory.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product?.name || 'Unknown',
          category: 'Uncategorized',
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          maxStock: item.maxStock,
          cost: product?.costPrice || 0,
          price: product?.sellingPrice || 0,
          isPerishable: product?.isPerishable || false,
          shelfLife: product?.shelfLifeDays || 0,
          lastRestocked: item.lastRestocked,
          averageDailyUsage: 0
        };
      });

      const systemPrompt = `You are an AI inventory management assistant for StockSense. 
      Analyze the inventory data and generate proactive recommendations.
      
      Focus on:
      1. Items approaching reorder points
      2. Slow-moving inventory that may become waste
      3. Seasonal opportunities
      4. Cost optimization
      5. Supplier performance issues
      
      For each recommendation, provide:
      - Type: reorder, waste_alert, optimization, seasonal, or supplier
      - Priority: low, medium, high, or critical
      - Clear title and description
      - Specific action to take
      - Expected impact/savings
      - Confidence level (0-100)
      
      Return as JSON array of recommendations.`;

      const prompt = `${systemPrompt}
      
      Current inventory data:
      ${JSON.stringify(inventoryData, null, 2)}
      
      Generate 3-5 actionable recommendations based on this data.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["reorder", "waste_alert", "optimization", "seasonal", "supplier"] },
                    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    action: { type: "string" },
                    impact: { type: "string" },
                    confidence: { type: "number" },
                    category: { type: "string" },
                    productId: { type: "number" },
                    quantityRecommended: { type: "number" },
                    costSavings: { type: "number" }
                  },
                  required: ["type", "priority", "title", "description", "action", "impact", "confidence", "category"]
                }
              }
            }
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || '{"recommendations": []}');
      
      return result.recommendations.map((rec: any, index: number) => ({
        id: `ai-rec-${Date.now()}-${index}`,
        ...rec,
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  }

  async analyzeInventoryTrends(userId: number, productId: number): Promise<InventoryInsight> {
    try {
      const inventory = await storage.getInventoryByProduct(userId, productId);
      const product = await storage.getProduct(productId, userId);
      
      if (!inventory || !product) {
        return {
          trend: 'stable',
          forecast: 0,
          riskLevel: 'low',
          suggestions: ['Insufficient data for analysis']
        };
      }

      const systemPrompt = `You are an AI inventory analyst. Analyze the inventory data for a single product and provide insights.
      
      Consider:
      - Current stock levels vs historical patterns
      - Seasonality and trends
      - Reorder patterns
      - Risk factors
      
      Provide analysis in JSON format with trend, forecast, risk level, and suggestions.`;

      const prompt = `${systemPrompt}
      
      Product: ${product.name}
      Category: Uncategorized
      Current Stock: ${inventory.currentStock}
      Reorder Point: ${inventory.reorderPoint}
      Max Stock: ${inventory.maxStock}
      Average Daily Usage: 0
      Is Perishable: ${product.isPerishable}
      Last Restocked: ${inventory.lastRestocked}
      
      Analyze this product's inventory trends and provide insights.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
              forecast: { type: "number" },
              riskLevel: { type: "string", enum: ["low", "medium", "high"] },
              suggestions: { type: "array", items: { type: "string" } }
            }
          }
        },
        contents: prompt
      });

      return JSON.parse(response.text || '{"trend": "stable", "forecast": 0, "riskLevel": "low", "suggestions": []}');

    } catch (error) {
      console.error('Error analyzing inventory trends:', error);
      return {
        trend: 'stable',
        forecast: 0,
        riskLevel: 'low',
        suggestions: ['Error analyzing trends']
      };
    }
  }

  async generateInventoryReport(userId: number): Promise<string> {
    try {
      const inventory = await storage.getInventory(userId);
      const products = await storage.getProducts(userId);
      
      if (!inventory || !products) {
        return "No inventory data available for analysis.";
      }

      const inventoryData = inventory.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product?.name || 'Unknown',
          category: 'Uncategorized',
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          maxStock: item.maxStock,
          cost: product?.costPrice || 0,
          price: product?.sellingPrice || 0,
          isPerishable: product?.isPerishable || false,
          lastRestocked: item.lastRestocked,
          averageDailyUsage: 0
        };
      });

      const systemPrompt = `You are an AI inventory analyst. Generate a comprehensive but concise inventory report.
      
      Include:
      1. Overall inventory health summary
      2. Key insights and patterns
      3. Risk areas requiring attention
      4. Optimization opportunities
      5. Actionable recommendations
      
      Keep the report professional, clear, and actionable for small business owners.`;

      const prompt = `${systemPrompt}
      
      Inventory Data:
      ${JSON.stringify(inventoryData, null, 2)}
      
      Generate a comprehensive inventory analysis report.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
      });

      return response.text || "Unable to generate report at this time.";

    } catch (error) {
      console.error('Error generating inventory report:', error);
      return "Error generating inventory report. Please try again later.";
    }
  }

  async optimizeReorderQuantities(userId: number, productIds: number[]): Promise<{[key: number]: number}> {
    try {
      const recommendations: {[key: number]: number} = {};
      
      for (const productId of productIds) {
        const inventory = await storage.getInventoryByProduct(userId, productId);
        const product = await storage.getProduct(productId);
        
        if (!inventory || !product) continue;

        const systemPrompt = `You are an AI inventory optimization expert. 
        Calculate the optimal reorder quantity for a product based on:
        - Current stock levels
        - Historical usage patterns
        - Lead times
        - Storage constraints
        - Cost considerations
        
        Provide just the recommended quantity as a number.`;

        const prompt = `${systemPrompt}
        
        Product: ${product.name}
        Current Stock: ${inventory.currentStock}
        Reorder Point: ${inventory.reorderPoint}
        Max Stock: ${inventory.maxStock}
        Average Daily Usage: 0
        Product Cost: ${product.costPrice}
        Is Perishable: ${product.isPerishable}
        Shelf Life: ${product.shelfLifeDays} days
        
        Calculate optimal reorder quantity.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        const quantity = parseInt(response.text?.trim() || '0');
        if (quantity > 0) {
          recommendations[productId] = quantity;
        }
      }

      return recommendations;

    } catch (error) {
      console.error('Error optimizing reorder quantities:', error);
      return {};
    }
  }
}

export const aiAssistant = new AIInventoryAssistant();