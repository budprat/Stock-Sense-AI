import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIRecommendation {
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

interface InventoryInsight {
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export function useAIRecommendations() {
  const { toast } = useToast();

  const { data: recommendations, isLoading: isLoadingRecommendations, error } = useQuery({
    queryKey: ["/api/ai/recommendations"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 3,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const generateRecommendations = useMutation({
    mutationFn: async (): Promise<AIRecommendation[]> => {
      return await apiRequest("GET", "/api/ai/recommendations");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/recommendations"] });
      toast({
        title: "AI Recommendations Updated",
        description: `Generated ${data.length} new recommendations`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate AI recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    recommendations: recommendations as AIRecommendation[] | undefined,
    isLoadingRecommendations,
    error,
    generateRecommendations,
    isGenerating: generateRecommendations.isPending,
  };
}

export function useInventoryInsights(productId: number | null) {
  const { toast } = useToast();

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["/api/ai/insights", productId],
    queryFn: async (): Promise<InventoryInsight> => {
      if (!productId) throw new Error("Product ID is required");
      return await apiRequest("GET", `/api/ai/insights/${productId}`);
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    insights,
    isLoadingInsights,
  };
}

export function useInventoryReport() {
  const { toast } = useToast();

  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ["/api/ai/report"],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const generateReport = useMutation({
    mutationFn: async (): Promise<{ report: string }> => {
      return await apiRequest("GET", "/api/ai/report");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/report"] });
      toast({
        title: "Report Generated",
        description: "Your inventory analysis report is ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate inventory report. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    report: reportData?.report,
    isLoadingReport,
    generateReport,
    isGeneratingReport: generateReport.isPending,
  };
}

export function useOptimizeReorder() {
  const { toast } = useToast();

  const optimizeReorder = useMutation({
    mutationFn: async (productIds: number[]): Promise<{[key: number]: number}> => {
      return await apiRequest("POST", "/api/ai/optimize-reorder", { productIds });
    },
    onSuccess: (data) => {
      const productCount = Object.keys(data).length;
      toast({
        title: "Reorder Optimization Complete",
        description: `Generated optimal quantities for ${productCount} products`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize reorder quantities. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    optimizeReorder,
    isOptimizing: optimizeReorder.isPending,
    optimizationResult: optimizeReorder.data,
  };
}

export function useAIAssistant() {
  const recommendations = useAIRecommendations();
  const report = useInventoryReport();
  const reorderOptimization = useOptimizeReorder();

  return {
    ...recommendations,
    ...report,
    ...reorderOptimization,
  };
}