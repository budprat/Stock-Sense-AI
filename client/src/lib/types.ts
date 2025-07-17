export interface DashboardStats {
  totalInventoryValue: number;
  itemsExpiringSoon: number;
  outOfStockItems: number;
  monthlySavings: number;
}

export interface InventoryHealth {
  healthy: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface AIRecommendation {
  id: number;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  confidence: number;
  recommendedAction: string;
  quantityRecommended?: number;
  isActioned: boolean;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    unit: string;
    imageUrl?: string;
  };
}

export interface InventoryItem {
  id: number;
  currentStock: string;
  reorderPoint: string;
  maxStock?: string;
  expirationDate?: string;
  product: {
    id: number;
    name: string;
    unit: string;
    imageUrl?: string;
    category?: {
      name: string;
    };
  };
}

export interface SupplierPerformance {
  name: string;
  grade: string;
  deliveryRate: number;
  avgLeadTime: number;
  qualityScore: number;
}

export interface DemandForecastData {
  month: string;
  actual: number;
  predicted: number;
}

export interface WasteAnalysisData {
  category: string;
  value: number;
  color: string;
}
