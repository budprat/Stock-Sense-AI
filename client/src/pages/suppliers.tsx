import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/app-layout";
import { Truck, Star, TrendingUp, TrendingDown, Plus, Phone, Mail, MapPin } from "lucide-react";

export default function Suppliers() {
  const { data: supplierData, isLoading } = useQuery({
    queryKey: ["/api/suppliers/performance"]
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const };
    if (score >= 70) return { label: "Good", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  return (
    <AppLayout>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage your supplier relationships and performance
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          {/* Supplier Performance Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Supplier Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {supplierData?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {supplierData?.filter((s: any) => s.grade >= 90).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Excellent Performers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {supplierData?.filter((s: any) => s.grade >= 70 && s.grade < 90).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Good Performers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {supplierData?.filter((s: any) => s.grade < 70).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Need Improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplierData?.map((supplier: any) => {
                const performanceBadge = getPerformanceBadge(supplier.grade);
                
                return (
                  <Card key={supplier.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <Truck className="h-6 w-6 text-muted-foreground mr-3" />
                          <div>
                            <CardTitle className="text-lg">{supplier.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {supplier.category || "General Supplier"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={performanceBadge.variant}>
                          {performanceBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Performance Score */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Performance Score</span>
                            <span className={`text-lg font-bold ${getPerformanceColor(supplier.grade)}`}>
                              {supplier.grade}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                supplier.grade >= 90 ? 'bg-green-500' :
                                supplier.grade >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${supplier.grade}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                            <p className="text-sm font-semibold">{supplier.onTimeDelivery || '95%'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Quality Rating</p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span className="text-sm font-semibold">{supplier.qualityRating || '4.8'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Orders</p>
                            <p className="text-sm font-semibold">{supplier.totalOrders || '127'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg Lead Time</p>
                            <p className="text-sm font-semibold">{supplier.leadTime || '2.3 days'}</p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-2" />
                            <span>{supplier.phone || '+1 (555) 123-4567'}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-2" />
                            <span>{supplier.email || 'contact@supplier.com'}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-2" />
                            <span>{supplier.location || 'New York, NY'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Place Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Supplier Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">FreshCorp Produce</p>
                      <p className="text-sm text-muted-foreground">Improved delivery time by 15%</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium">Prime Meats & Seafood</p>
                      <p className="text-sm text-muted-foreground">Received 5-star quality rating</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium">Dairy Direct</p>
                      <p className="text-sm text-muted-foreground">Delivery delayed - performance score updated</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
    </AppLayout>
  );
}