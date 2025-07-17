import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, AlertTriangle, PiggyBank } from "lucide-react";
import AnimatedMetricCard from "@/components/charts/animated-metric-card";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Inventory Value",
      value: stats?.totalInventoryValue || 0,
      previousValue: (stats?.totalInventoryValue || 0) * 0.92,
      unit: "$",
      trend: "up" as const,
      trendPercentage: 8.2,
      status: "good" as const,
      icon: <TrendingUp className="h-4 w-4 text-green-600" />,
      description: "Increased from last month"
    },
    {
      title: "Items Expiring Soon",
      value: stats?.itemsExpiringSoon || 0,
      previousValue: (stats?.itemsExpiringSoon || 0) + 2,
      unit: "items",
      trend: "down" as const,
      trendPercentage: -12.5,
      status: "warning" as const,
      icon: <Clock className="h-4 w-4 text-orange-600" />,
      description: "Next 7 days"
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStockItems || 0,
      previousValue: (stats?.outOfStockItems || 0) + 1,
      unit: "items",
      trend: "down" as const,
      trendPercentage: -25.0,
      status: stats?.outOfStockItems > 0 ? "danger" as const : "good" as const,
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      description: "Requires immediate attention"
    },
    {
      title: "Monthly Savings",
      value: stats?.monthlySavings || 0,
      previousValue: (stats?.monthlySavings || 0) * 0.85,
      unit: "$",
      trend: "up" as const,
      trendPercentage: 15.3,
      status: "good" as const,
      icon: <PiggyBank className="h-4 w-4 text-blue-600" />,
      description: "AI-powered optimization"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statItems.map((item, index) => (
        <AnimatedMetricCard
          key={index}
          title={item.title}
          value={item.value}
          previousValue={item.previousValue}
          unit={item.unit}
          trend={item.trend}
          trendPercentage={item.trendPercentage}
          status={item.status}
          icon={item.icon}
          description={item.description}
          animationDelay={index * 100}
        />
      ))}
    </div>
  );
}
