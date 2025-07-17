import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIRecommendation } from "@/lib/types";

export function useAIRecommendations() {
  return useQuery<AIRecommendation[]>({
    queryKey: ["/api/recommendations"],
  });
}

export function useUpdateRecommendation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActioned }: { id: number; isActioned: boolean }) => {
      await apiRequest("PATCH", `/api/recommendations/${id}`, { isActioned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });
}
