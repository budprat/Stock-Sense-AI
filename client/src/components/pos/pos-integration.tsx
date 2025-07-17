import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  RefreshCw, 
  Store, 
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Clock
} from "lucide-react";

interface POSSystem {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  transactionCount: number;
  features: string[];
  setupRequired: boolean;
}

const availablePOSSystems: POSSystem[] = [
  {
    id: "square",
    name: "Square",
    logo: "🔲",
    status: "connected",
    lastSync: "2 minutes ago",
    transactionCount: 1247,
    features: ["Real-time sync", "Inventory tracking", "Sales analytics"],
    setupRequired: false
  },
  {
    id: "toast",
    name: "Toast",
    logo: "🍞",
    status: "disconnected",
    lastSync: "Never",
    transactionCount: 0,
    features: ["Restaurant features", "Menu management", "Kitchen display"],
    setupRequired: true
  },
  {
    id: "shopify",
    name: "Shopify",
    logo: "🛍️",
    status: "connected",
    lastSync: "5 minutes ago",
    transactionCount: 892,
    features: ["E-commerce sync", "Online orders", "Customer data"],
    setupRequired: false
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    logo: "⚡",
    status: "error",
    lastSync: "2 hours ago",
    transactionCount: 567,
    features: ["Multi-location", "Advanced reporting", "Loyalty programs"],
    setupRequired: false
  }
];

export default function POSIntegration() {
  const [selectedPOS, setSelectedPOS] = useState<POSSystem | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: syncStats } = useQuery({
    queryKey: ["/api/pos/sync-stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const syncPOSMutation = useMutation({
    mutationFn: async (posId: string) => {
      return apiRequest("POST", `/api/pos/${posId}/sync`);
    },
    onSuccess: (data, posId) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.itemsUpdated} items from ${posId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sync-stats"] });
    },
    onError: (error, posId) => {
      toast({
        title: "Sync Failed",
        description: `Failed to sync with ${posId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const connectPOSMutation = useMutation({
    mutationFn: async (data: { posId: string; credentials: any }) => {
      return apiRequest("POST", `/api/pos/${data.posId}/connect`, data.credentials);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "POS Connected",
        description: `Successfully connected to ${variables.posId}`,
      });
      setSetupDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sync-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSync = async (posId: string) => {
    setSyncInProgress(true);
    try {
      await syncPOSMutation.mutateAsync(posId);
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleSetupPOS = (pos: POSSystem) => {
    setSelectedPOS(pos);
    setSetupDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sync Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{syncStats?.totalTransactions || 0}</div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats?.itemsSynced || 0}</div>
              <p className="text-sm text-muted-foreground">Items Synced</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStats?.lastSyncMinutes || 0}m</div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{syncStats?.connectedSystems || 0}</div>
              <p className="text-sm text-muted-foreground">Connected Systems</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POS Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Point of Sale Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePOSSystems.map((pos) => (
              <Card key={pos.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{pos.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{pos.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {pos.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(pos.status)}
                      {getStatusBadge(pos.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Last sync: {pos.lastSync}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {pos.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {pos.status === 'connected' ? (
                        <Button
                          size="sm"
                          onClick={() => handleSync(pos.id)}
                          disabled={syncInProgress}
                          className="flex-1"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {syncInProgress ? "Syncing..." : "Sync Now"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetupPOS(pos)}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {pos.setupRequired ? "Setup" : "Reconnect"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Setup {selectedPOS?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl mb-2">{selectedPOS?.logo}</div>
              <p className="text-sm text-muted-foreground">
                Connect your {selectedPOS?.name} system to sync inventory and sales data
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  placeholder="Enter your API key"
                  type="password"
                />
              </div>
              
              <div>
                <Label htmlFor="storeId">Store ID</Label>
                <Input 
                  id="storeId" 
                  placeholder="Enter your store ID"
                />
              </div>
              
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSetupDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Simulate connection
                  connectPOSMutation.mutate({
                    posId: selectedPOS?.id || "",
                    credentials: {
                      apiKey: "demo-key",
                      storeId: "demo-store",
                      environment: "production"
                    }
                  });
                }}
                disabled={connectPOSMutation.isPending}
              >
                {connectPOSMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}