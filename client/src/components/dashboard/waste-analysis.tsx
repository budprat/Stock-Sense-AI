import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import AnimatedBarChart from "@/components/charts/animated-bar-chart";

export default function WasteAnalysis() {
  const { data: wasteData, isLoading } = useQuery({
    queryKey: ["/api/analytics/waste-analysis"],
  });

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash2 className="mr-2 h-5 w-5 text-primary" />
            Waste Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for bar chart
  const barData = wasteData?.map(item => ({
    label: item.category,
    value: item.value,
    color: item.color,
    percentage: item.value // Assuming value is already percentage
  })) || [];

  return (
    <AnimatedBarChart
      title="Waste Analysis"
      data={barData}
      animationDelay={800}
      height={300}
      showValues={true}
      showPercentages={true}
      horizontal={true}
    />
  );
}
