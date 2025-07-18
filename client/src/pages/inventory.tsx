import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/app-layout";
import AddProductForm from "@/components/forms/add-product-form";
import POSIntegration from "@/components/pos/pos-integration";
import { Package, Search, Plus, AlertTriangle, CheckCircle, Clock, Settings, Zap } from "lucide-react";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["/api/inventory"]
  });

  const getHealthStatus = (currentStock: number, reorderPoint: number) => {
    if (currentStock === 0) return { label: "Out of Stock", color: "red", icon: AlertTriangle };
    if (currentStock <= reorderPoint) return { label: "Low Stock", color: "orange", icon: Clock };
    return { label: "In Stock", color: "green", icon: CheckCircle };
  };

  const filteredInventory = inventoryData?.filter((item: any) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.product.category?.name === categoryFilter;
    const status = getHealthStatus(item.currentStock, item.reorderPoint);
    const matchesStatus = statusFilter === "all" || status.label.toLowerCase().includes(statusFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const categories = inventoryData?.reduce((acc: string[], item: any) => {
    const categoryName = item.product.category?.name;
    if (categoryName && !acc.includes(categoryName)) {
      acc.push(categoryName);
    }
    return acc;
  }, []) || [];

  return (
    <AppLayout>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your inventory levels in real-time
              </p>
            </div>
            <div className="flex gap-2">
              <AddProductForm />
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inventory" className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                POS Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                        <SelectItem value="in">In Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

          {/* Inventory Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item: any) => {
                const status = getHealthStatus(item.currentStock, item.reorderPoint);
                const StatusIcon = status.icon;
                
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-muted-foreground mr-2" />
                          <div>
                            <CardTitle className="text-lg">{item.product.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{item.product.sku}</p>
                          </div>
                        </div>
                        <Badge variant={status.color === 'red' ? 'destructive' : status.color === 'orange' ? 'outline' : 'default'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Stock:</span>
                          <span className="font-semibold">{item.currentStock} {item.product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reorder Point:</span>
                          <span>{item.reorderPoint} {item.product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Max Stock:</span>
                          <span>{item.maxStock} {item.product.unit}</span>
                        </div>
                        {item.product.category && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Category:</span>
                            <span>{item.product.category.name}</span>
                          </div>
                        )}
                        {item.expirationDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Expires:</span>
                            <span className="text-sm">
                              {new Date(item.expirationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Update Stock
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

              {filteredInventory.length === 0 && !isLoading && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all" 
                        ? "Try adjusting your filters or search terms."
                        : "Get started by adding your first product."}
                    </p>
                    <AddProductForm 
                      trigger={
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pos" className="space-y-6">
              <POSIntegration />
            </TabsContent>
          </Tabs>
    </AppLayout>
  );
}