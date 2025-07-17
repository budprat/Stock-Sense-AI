import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import AnimatedLineChart from "@/components/charts/animated-line-chart";

export default function DemandForecast() {
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ["/api/analytics/demand-forecast"],
  });

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform the data to include predicted flag for line chart
  const transformedData = forecastData?.map(item => ([
    {
      label: item.month,
      value: item.actual,
      predicted: false
    },
    {
      label: item.month,
      value: item.predicted,
      predicted: true
    }
  ])).flat().filter(item => item.value > 0) || [];

  return (
    <AnimatedLineChart
      title="Demand Forecast"
      data={transformedData}
      color="#3b82f6"
      predictedColor="#10b981"
      animationDelay={600}
      height={320}
      showGrid={true}
      showDots={true}
      showArea={true}
    />
  );
}
