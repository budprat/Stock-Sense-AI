import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  const updateRecommendation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/recommendations/${id}`, { isActioned: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Action Completed",
        description: "Recommendation has been marked as actioned.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionButtonColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((recommendation: any) => (
            <div
              key={recommendation.id}
              className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      recommendation.priority === "critical" ? "bg-red-500" :
                      recommendation.priority === "high" ? "bg-orange-500" :
                      recommendation.priority === "medium" ? "bg-yellow-500" : "bg-gray-500"
                    }`} />
                    <h4 className="font-medium">{recommendation.product?.name}</h4>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {recommendation.type}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{recommendation.message}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <Progress 
                      value={parseFloat(recommendation.confidence) * 100} 
                      className="w-20 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(parseFloat(recommendation.confidence) * 100)}%
                    </span>
                  </div>
                </div>
                <Button
                  variant={getActionButtonColor(recommendation.priority) as any}
                  size="sm"
                  onClick={() => updateRecommendation.mutate(recommendation.id)}
                  disabled={updateRecommendation.isPending}
                >
                  {recommendation.recommendedAction}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
