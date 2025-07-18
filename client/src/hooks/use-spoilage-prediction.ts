import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface SpoilageRisk {
  productId: number;
  productName: string;
  currentStock: number;
  daysUntilExpiry: number;
  spoilageRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  predictedSpoilageDate: string;
  recommendedAction: string;
  factors: {
    temperature: number;
    humidity: number;
    seasonality: number;
    historicalWaste: number;
    storageConditions: number;
  };
}

export interface SpoilagePrediction {
  productId: number;
  predictedSpoilageDate: string;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export function useSpoilageRisks() {
  return useQuery({
    queryKey: ['/api/spoilage/risks'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useSpoilagePredictions() {
  return useQuery({
    queryKey: ['/api/spoilage/predictions'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUpdateStorageConditions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, conditions }: { productId: number; conditions: any }) => {
      return apiRequest('PUT', `/api/spoilage/storage-conditions/${productId}`, {
        conditions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spoilage/risks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spoilage/predictions'] });
      toast({
        title: "Storage conditions updated",
        description: "The storage conditions have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating storage conditions",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Storage conditions tracking
export function useStorageConditions(productId: number) {
  return useQuery({
    queryKey: ['/api/storage-conditions', productId],
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateStorageCondition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (condition: any) => {
      return apiRequest('POST', '/api/storage-conditions', condition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/storage-conditions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spoilage/risks'] });
      toast({
        title: "Storage condition recorded",
        description: "The storage condition has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error recording storage condition",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Critical alerts
export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['/api/critical-alerts'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useCreateCriticalAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alert: any) => {
      return apiRequest('POST', '/api/critical-alerts', alert);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/critical-alerts'] });
      toast({
        title: "Critical alert created",
        description: "The critical alert has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating critical alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useResolveCriticalAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest('PUT', `/api/critical-alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/critical-alerts'] });
      toast({
        title: "Alert resolved",
        description: "The critical alert has been successfully resolved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error resolving alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Batch processing
export function useBatchJobs() {
  return useQuery({
    queryKey: ['/api/batch-jobs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBatchJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: any) => {
      return apiRequest('POST', '/api/batch-jobs', job);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batch-jobs'] });
      toast({
        title: "Batch job created",
        description: "The batch processing job has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating batch job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useStartBatchJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest('POST', `/api/batch-jobs/${jobId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batch-jobs'] });
      toast({
        title: "Batch job started",
        description: "The batch processing job has been successfully started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error starting batch job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSpoilageStats() {
  const { data: risks } = useSpoilageRisks();
  
  if (!risks || !Array.isArray(risks)) return null;

  const criticalItems = risks.filter((risk: SpoilageRisk) => risk.spoilageRisk === 'critical');
  const highRiskItems = risks.filter((risk: SpoilageRisk) => risk.spoilageRisk === 'high');
  const mediumRiskItems = risks.filter((risk: SpoilageRisk) => risk.spoilageRisk === 'medium');
  const lowRiskItems = risks.filter((risk: SpoilageRisk) => risk.spoilageRisk === 'low');

  const averageDaysToExpiry = risks.length > 0 
    ? risks.reduce((acc: number, risk: SpoilageRisk) => acc + risk.daysUntilExpiry, 0) / risks.length
    : 0;

  const averageRiskScore = risks.length > 0
    ? risks.reduce((acc: number, risk: SpoilageRisk) => acc + (risk.riskScore || 0), 0) / risks.length
    : 0;

  return {
    totalItems: risks.length,
    criticalItems: criticalItems.length,
    highRiskItems: highRiskItems.length,
    mediumRiskItems: mediumRiskItems.length,
    lowRiskItems: lowRiskItems.length,
    averageDaysToExpiry: Math.round(averageDaysToExpiry),
    averageRiskScore: Math.round(averageRiskScore * 100),
    mostCriticalItems: criticalItems.slice(0, 5),
    urgentActions: criticalItems.length + highRiskItems.length,
  };
}

export function useSpoilageAlerts() {
  const { data: risks } = useSpoilageRisks();
  
  if (!risks || !Array.isArray(risks)) return [];

  const alerts = [];
  
  // Critical items alert
  const criticalItems = risks.filter((risk: SpoilageRisk) => risk.spoilageRisk === 'critical');
  if (criticalItems.length > 0) {
    alerts.push({
      type: 'critical',
      title: 'Critical Spoilage Risk',
      message: `${criticalItems.length} items require immediate attention to prevent waste.`,
      items: criticalItems,
    });
  }

  // Items expiring soon
  const expiringSoon = risks.filter((risk: SpoilageRisk) => risk.daysUntilExpiry <= 2);
  if (expiringSoon.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Items Expiring Soon',
      message: `${expiringSoon.length} items are expiring within 2 days.`,
      items: expiringSoon,
    });
  }

  // High waste risk items
  const highWasteRisk = risks.filter((risk: SpoilageRisk) => risk.factors && risk.factors.historicalWaste && risk.factors.historicalWaste > 0.7);
  if (highWasteRisk.length > 0) {
    alerts.push({
      type: 'info',
      title: 'High Historical Waste',
      message: `${highWasteRisk.length} items have a pattern of high waste. Consider reducing order quantities.`,
      items: highWasteRisk,
    });
  }

  return alerts;
}