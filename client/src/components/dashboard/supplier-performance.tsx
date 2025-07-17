import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";

export default function SupplierPerformance() {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/api/suppliers/performance"],
  });

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return <Badge className="bg-green-100 text-green-800">{grade}</Badge>;
      case "B+":
      case "B":
        return <Badge className="bg-yellow-100 text-yellow-800">{grade}</Badge>;
      case "C+":
      case "C":
        return <Badge className="bg-red-100 text-red-800">{grade}</Badge>;
      default:
        return <Badge variant="outline">{grade}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5 text-primary" />
            Supplier Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-5 w-5 text-primary" />
          Supplier Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suppliers?.map((supplier: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{supplier.name}</h4>
                {getGradeBadge(supplier.grade)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Rate</span>
                  <span className="font-medium">{supplier.deliveryRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Lead Time</span>
                  <span className="font-medium">{supplier.avgLeadTime} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span className="font-medium">{supplier.qualityScore}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
