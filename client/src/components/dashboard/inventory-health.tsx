import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";
import AnimatedDonutChart from "@/components/charts/animated-donut-chart";
import AnimatedProgressRing from "@/components/charts/animated-progress-ring";

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

  const donutData = [
    {
      label: "Healthy Stock",
      value: health?.healthy || 0,
      color: "#10b981",
      percentage: healthyPercentage
    },
    {
      label: "Low Stock",
      value: health?.lowStock || 0,
      color: "#f59e0b",
      percentage: lowStockPercentage
    },
    {
      label: "Critical/Out",
      value: health?.outOfStock || 0,
      color: "#ef4444",
      percentage: outOfStockPercentage
    }
  ];

  return (
    <div className="space-y-6">
      <AnimatedDonutChart
        title="Inventory Health"
        data={donutData}
        centerValue={totalItems}
        centerLabel="Total Items"
        animationDelay={400}
        size="md"
      />
      
      <AnimatedProgressRing
        title="Health Score"
        value={overallHealthScore}
        maxValue={100}
        label={overallHealthScore >= 80 ? "Excellent" : 
               overallHealthScore >= 60 ? "Good" : 
               overallHealthScore >= 40 ? "Fair" : "Poor"}
        color={overallHealthScore >= 80 ? "#10b981" : 
               overallHealthScore >= 60 ? "#3b82f6" : 
               overallHealthScore >= 40 ? "#f59e0b" : "#ef4444"}
        animationDelay={800}
        icon={<Shield className="h-4 w-4" />}
      />
    </div>
  );
}
