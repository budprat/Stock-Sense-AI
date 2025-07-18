import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Package,
  Settings,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";

import AppLayout from "@/components/layout/app-layout";

export default function AutomatedPurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [automationSettings, setAutomationSettings] = useState({
    enabled: true,
    reorderThreshold: 10,
    leadTimeBuffer: 3,
    maxOrderValue: 1000,
    autoApproveUnder: 500,
  });

  const { data: automatedOrders, isLoading } = useQuery({
    queryKey: ["/api/purchase-orders/automated"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: suppliers } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const { data: recommendations } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  const approveOrder = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest(`/api/purchase-orders/${orderId}/approve`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Approved",
        description: "The purchase order has been approved and sent to the supplier.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders/automated"] });
    },
  });

  const createAutomatedOrder = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("/api/purchase-orders/automated", {
        method: "POST",
        body: orderData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "Automated purchase order has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders/automated"] });
    },
  });

  const handleApproveOrder = (orderId: number) => {
    approveOrder.mutate(orderId);
  };

  const handleCreateOrder = (recommendation: any) => {
    const orderData = {
      supplierId: recommendation.supplierId || 1,
      productId: recommendation.productId,
      quantity: parseFloat(recommendation.quantityRecommended),
      unitPrice: 10.99, // This should come from supplier prices
      organizationId: 1,
    };
    createAutomatedOrder.mutate(orderData);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Automated Purchase Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered purchase order automation to maintain optimal inventory levels
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="settings">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$1,247</div>
                <div className="text-sm text-gray-600">Through automation</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-gray-600">Orders awaiting review</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600">Orders automated</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Automation Performance
              </CardTitle>
              <CardDescription>
                How automation is improving your inventory management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Accuracy</span>
                  <span className="text-sm text-gray-600">98.5%</span>
                </div>
                <Progress value={98.5} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Savings</span>
                  <span className="text-sm text-gray-600">4.2 hours/week</span>
                </div>
                <Progress value={85} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cost Optimization</span>
                  <span className="text-sm text-gray-600">15% reduction</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Orders Pending Approval
              </CardTitle>
              <CardDescription>
                Review and approve automated purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automatedOrders?.filter((order: any) => order.status === 'draft').map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplier?.name || 'Unknown'}</TableCell>
                        <TableCell>Multiple Items</TableCell>
                        <TableCell>Various</TableCell>
                        <TableCell>${order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={approveOrder.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Purchase Recommendations
              </CardTitle>
              <CardDescription>
                Smart recommendations based on inventory levels and demand forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations?.filter((rec: any) => rec.type === 'reorder').map((recommendation: any) => (
                  <div key={recommendation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          recommendation.priority === 'critical' ? 'bg-red-500' :
                          recommendation.priority === 'high' ? 'bg-orange-500' :
                          recommendation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-medium">{recommendation.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-gray-600">{recommendation.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Qty: {recommendation.quantityRecommended}
                        </Badge>
                        <Badge variant="outline">
                          Confidence: {Math.round(parseFloat(recommendation.confidence || '0') * 100)}%
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleCreateOrder(recommendation)}
                          disabled={createAutomatedOrder.isPending}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Create Order
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Settings
              </CardTitle>
              <CardDescription>
                Configure your automated purchase order preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="automation-enabled">Enable Automation</Label>
                  <p className="text-sm text-gray-600">
                    Automatically create purchase orders based on inventory levels
                  </p>
                </div>
                <Switch
                  id="automation-enabled"
                  checked={automationSettings.enabled}
                  onCheckedChange={(checked) => 
                    setAutomationSettings({ ...automationSettings, enabled: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reorder-threshold">Reorder Threshold (%)</Label>
                  <Input
                    id="reorder-threshold"
                    type="number"
                    placeholder="10"
                    value={automationSettings.reorderThreshold}
                    onChange={(e) => 
                      setAutomationSettings({ 
                        ...automationSettings, 
                        reorderThreshold: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Trigger reorder when stock falls below this percentage
                  </p>
                </div>

                <div>
                  <Label htmlFor="lead-time-buffer">Lead Time Buffer (days)</Label>
                  <Input
                    id="lead-time-buffer"
                    type="number"
                    placeholder="3"
                    value={automationSettings.leadTimeBuffer}
                    onChange={(e) => 
                      setAutomationSettings({ 
                        ...automationSettings, 
                        leadTimeBuffer: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Additional days to account for delivery delays
                  </p>
                </div>

                <div>
                  <Label htmlFor="max-order-value">Max Order Value ($)</Label>
                  <Input
                    id="max-order-value"
                    type="number"
                    placeholder="1000"
                    value={automationSettings.maxOrderValue}
                    onChange={(e) => 
                      setAutomationSettings({ 
                        ...automationSettings, 
                        maxOrderValue: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Maximum value for automated orders
                  </p>
                </div>

                <div>
                  <Label htmlFor="auto-approve">Auto-Approve Under ($)</Label>
                  <Input
                    id="auto-approve"
                    type="number"
                    placeholder="500"
                    value={automationSettings.autoApproveUnder}
                    onChange={(e) => 
                      setAutomationSettings({ 
                        ...automationSettings, 
                        autoApproveUnder: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically approve orders below this value
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Save Automation Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}