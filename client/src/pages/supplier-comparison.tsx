import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Shield,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  Truck
} from "lucide-react";

import AppLayout from "@/components/layout/app-layout";

export default function SupplierComparison() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers/marketplace"],
  });

  const { data: supplierPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/supplier-prices", selectedProduct],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: supplierReviews } = useQuery({
    queryKey: ["/api/supplier-reviews", selectedSupplier],
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Supplier Comparison
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compare prices, ratings, and performance across all suppliers
        </p>
      </div>

      <Tabs defaultValue="price-comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="supplier-directory">Supplier Directory</TabsTrigger>
          <TabsTrigger value="performance-analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="price-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Comparison Tool
              </CardTitle>
              <CardDescription>
                Find the best prices for your products across all suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="product-search">Search Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to compare" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier-filter">Filter by Supplier</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Min Qty</TableHead>
                        <TableHead>Lead Time</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierPrices?.map((price: any) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {price.supplier.isVerified && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {price.supplier.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {price.unitPrice}
                            </div>
                          </TableCell>
                          <TableCell>{price.minimumQuantity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {price.leadTimeDays} days
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              {price.supplier.rating}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={price.isActive ? "default" : "secondary"}>
                              {price.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Create Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier-directory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Supplier Directory
              </CardTitle>
              <CardDescription>
                Browse and evaluate suppliers in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="supplier-search">Search Suppliers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="supplier-search"
                    placeholder="Search by name, specialty, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers?.filter((supplier: any) =>
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((supplier: any) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {supplier.isVerified && (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                          {supplier.name}
                        </CardTitle>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium">{supplier.rating}</span>
                          <span className="text-gray-500">({supplier.totalReviews} reviews)</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {supplier.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4" />
                            Min Order: ${supplier.minimumOrderAmount}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4" />
                            Ships to: {supplier.shippingZones?.join(", ")}
                          </div>
                        </div>
                        
                        {supplier.specialties && (
                          <div className="flex flex-wrap gap-1">
                            {supplier.specialties.slice(0, 3).map((specialty: string) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button size="sm" className="flex-1">
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance-analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Rated Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">FreshCorp</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400" />
                  4.9 rating
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Best Price Point</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">BulkSupply Co</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  15% below average
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Fastest Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">QuickMart</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Same day delivery
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Most Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">TrustedVendor</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  99.8% on-time
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Comparison</CardTitle>
              <CardDescription>
                Compare key metrics across your suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>On-Time Delivery</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead>Price Trend</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers?.map((supplier: any) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {supplier.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {supplier.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            {supplier.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            98.5%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-blue-600">
                            4.2/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">+2.1%</span>
                          </div>
                        </TableCell>
                        <TableCell>&lt; 2 hours</TableCell>
                        <TableCell>
                          <Badge variant={supplier.isActive ? "default" : "secondary"}>
                            {supplier.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}