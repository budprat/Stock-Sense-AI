import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
      percentage: healthyPercentage,
      emoji: "🟢"
    },
    {
      label: "Low Stock",
      value: health?.lowStock || 0,
      color: "#f59e0b",
      percentage: lowStockPercentage,
      emoji: "🟡"
    },
    {
      label: "Critical/Out",
      value: health?.outOfStock || 0,
      color: "#ef4444",
      percentage: outOfStockPercentage,
      emoji: "🔴"
    }
  ];

  const getHealthEmoji = (score: number) => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "😊";
    if (score >= 70) return "🙂";
    if (score >= 60) return "😐";
    if (score >= 40) return "😟";
    return "😰";
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Poor";
    return "Critical";
  };

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
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {donutData.map((item, index) => (
          <Card key={index} className="p-4 text-center">
            <div className="text-2xl mb-2">{item.emoji}</div>
            <div className="text-lg font-semibold">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
            <Badge variant="outline" className="mt-2">
              {Math.round(item.percentage)}%
            </Badge>
          </Card>
        ))}
      </div>
      
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">{getHealthEmoji(overallHealthScore)}</div>
        <div className="text-2xl font-bold mb-2">{overallHealthScore}%</div>
        <div className="text-lg text-gray-600 mb-4">Overall Health: {getHealthStatus(overallHealthScore)}</div>
        <Progress value={overallHealthScore} className="w-full" />
      </Card>
    </div>
  );
}
