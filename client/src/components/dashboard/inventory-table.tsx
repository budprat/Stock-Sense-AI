import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Download } from "lucide-react";

export default function InventoryTable() {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const getStatusBadge = (currentStock: string, reorderPoint: string) => {
    const current = parseFloat(currentStock);
    const reorder = parseFloat(reorderPoint);
    
    if (current === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (current <= reorder) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
    }
  };

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return "N/A";
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Expired";
    if (diffDays <= 7) return `${diffDays} days`;
    return `${diffDays} days`;
  };

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Current Inventory
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-primary" />
            Current Inventory
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <img
                        src={item.product?.imageUrl || "/placeholder.svg"}
                        alt={item.product?.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product?.category?.name || "Uncategorized"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.currentStock} {item.product?.unit}</TableCell>
                  <TableCell>{item.reorderPoint} {item.product?.unit}</TableCell>
                  <TableCell>
                    {getStatusBadge(item.currentStock, item.reorderPoint)}
                  </TableCell>
                  <TableCell>{getExpirationStatus(item.expirationDate)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-primary">
                      {parseFloat(item.currentStock) === 0 ? "Emergency Order" : 
                       parseFloat(item.currentStock) <= parseFloat(item.reorderPoint) ? "Order" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
