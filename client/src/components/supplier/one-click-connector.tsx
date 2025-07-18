import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap, 
  Check, 
  Star, 
  Shield, 
  Clock, 
  DollarSign, 
  Package, 
  Truck,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  location: string;
  specialties: string[];
  description: string;
  discount: number;
  deliveryTime: string;
  minimumOrder: number;
  contactEmail: string;
  phone: string;
  isActive: boolean;
}

interface OneClickConnectorProps {
  supplier: Supplier;
  isConnected?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export default function OneClickConnector({ supplier, isConnected = false, onConnectionChange }: OneClickConnectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  
  const connectionSteps = [
    { name: "Verifying Supplier", icon: Shield, completed: false },
    { name: "Checking Availability", icon: Clock, completed: false },
    { name: "Negotiating Terms", icon: DollarSign, completed: false },
    { name: "Setting Up Integration", icon: Package, completed: false },
    { name: "Testing Connection", icon: Zap, completed: false },
    { name: "Connection Complete", icon: CheckCircle2, completed: false }
  ];

  const connectSupplier = useMutation({
    mutationFn: async () => {
      // Simulate connection process with steps
      for (let i = 0; i < connectionSteps.length; i++) {
        setConnectionStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      return await apiRequest("/api/suppliers/connect", {
        method: "POST",
        body: { supplierId: supplier.id }
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection Successful! 🎉",
        description: `You're now connected to ${supplier.name}. Start ordering immediately!`,
      });
      setIsDialogOpen(false);
      setConnectionStep(0);
      onConnectionChange?.(true);
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${supplier.name}. Please try again.`,
        variant: "destructive",
      });
      setConnectionStep(0);
    },
  });

  const disconnectSupplier = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/suppliers/${supplier.id}/disconnect`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: `You've disconnected from ${supplier.name}.`,
      });
      onConnectionChange?.(false);
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
    onError: (error) => {
      toast({
        title: "Disconnection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (isConnected) {
      disconnectSupplier.mutate();
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleConfirmConnection = () => {
    connectSupplier.mutate();
  };

  return (
    <>
      <Button
        onClick={handleConnect}
        disabled={connectSupplier.isPending || disconnectSupplier.isPending}
        className={`${isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
        {(connectSupplier.isPending || disconnectSupplier.isPending) && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        {isConnected ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Connected
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Connect Instantly
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Connect to {supplier.name}
            </DialogTitle>
            <DialogDescription>
              Instantly connect and start ordering from this verified supplier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Supplier Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {supplier.verified && <Shield className="h-4 w-4 text-green-600" />}
                    {supplier.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-green-600">
                    {supplier.discount}% OFF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{supplier.rating} ({supplier.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>{supplier.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Min: ${supplier.minimumOrder}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    <span>{supplier.specialties[0]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You Get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Instant Ordering</div>
                      <div className="text-sm text-gray-600">Order directly from your inventory dashboard</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Auto-Reorder Integration</div>
                      <div className="text-sm text-gray-600">Automatic purchase orders when stock is low</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Exclusive Pricing</div>
                      <div className="text-sm text-gray-600">{supplier.discount}% discount on all orders</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Progress */}
            {connectSupplier.isPending && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connecting...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={(connectionStep + 1) / connectionSteps.length * 100} />
                    <div className="space-y-2">
                      {connectionSteps.map((step, index) => (
                        <div key={index} className={`flex items-center gap-3 ${
                          index <= connectionStep ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <step.icon className="h-4 w-4" />
                          <span className="text-sm">{step.name}</span>
                          {index < connectionStep && <Check className="h-4 w-4 ml-auto" />}
                          {index === connectionStep && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {!connectSupplier.isPending && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmConnection}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Connect Now
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}