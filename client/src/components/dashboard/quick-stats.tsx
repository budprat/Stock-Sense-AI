import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, AlertTriangle, PiggyBank } from "lucide-react";

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
      value: `$${stats?.totalInventoryValue?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Items Expiring Soon",
      value: stats?.itemsExpiringSoon || 0,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStockItems || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Monthly Savings",
      value: `$${stats?.monthlySavings?.toLocaleString() || '0'}`,
      icon: PiggyBank,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
