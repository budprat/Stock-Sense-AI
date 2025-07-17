import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

export default function InventoryHealth() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["/api/inventory/health"],
  });

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Inventory Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalItems = health?.healthy + health?.lowStock + health?.outOfStock || 1;
  const healthyPercentage = (health?.healthy / totalItems) * 100;
  const lowStockPercentage = (health?.lowStock / totalItems) * 100;
  const outOfStockPercentage = (health?.outOfStock / totalItems) * 100;

  const overallHealthScore = Math.round(healthyPercentage);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Inventory Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Healthy Stock</span>
            <span className="text-sm font-semibold text-green-600">{health?.healthy || 0} items</span>
          </div>
          <Progress value={healthyPercentage} className="h-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Low Stock</span>
            <span className="text-sm font-semibold text-orange-600">{health?.lowStock || 0} items</span>
          </div>
          <Progress value={lowStockPercentage} className="h-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Critical/Out</span>
            <span className="text-sm font-semibold text-red-600">{health?.outOfStock || 0} items</span>
          </div>
          <Progress value={outOfStockPercentage} className="h-2" />
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Health Score</h4>
          <div className="text-3xl font-bold text-blue-900 mt-2">{overallHealthScore}%</div>
          <p className="text-sm text-blue-700 mt-1">
            {overallHealthScore >= 80 ? "Excellent" : 
             overallHealthScore >= 60 ? "Good" : 
             overallHealthScore >= 40 ? "Fair" : "Poor"} - 
            {overallHealthScore >= 60 ? " Above average performance" : " Needs attention"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
