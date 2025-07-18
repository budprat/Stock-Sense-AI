import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Clock,
  Package,
  TrendingDown,
  DollarSign,
  Users,
  Zap
} from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'critical';
  title: string;
  message: string;
  emoji: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  action?: string;
  actionUrl?: string;
  category: 'inventory' | 'orders' | 'suppliers' | 'system' | 'alerts';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: notificationStats } = useQuery({
    queryKey: ["/api/notifications/stats"],
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/stats"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast({
        title: "All Notifications Read",
        description: "All notifications have been marked as read.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/stats"] });
    },
  });

  const dismissNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/stats"] });
    },
  });

  // Sample notifications for demo
  const sampleNotifications: Notification[] = [
    {
      id: "1",
      type: "critical",
      title: "Critical Stock Alert",
      message: "Fresh Tomatoes are critically low (5 units remaining)",
      emoji: "🍅",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionable: true,
      action: "Reorder Now",
      actionUrl: "/inventory",
      category: "alerts",
      priority: "critical"
    },
    {
      id: "2",
      type: "warning",
      title: "Items Expiring Soon",
      message: "3 items will expire within 2 days",
      emoji: "⏰",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      actionable: true,
      action: "View Items",
      actionUrl: "/spoilage",
      category: "alerts",
      priority: "high"
    },
    {
      id: "3",
      type: "success",
      title: "Order Delivered",
      message: "Your order from FreshCorp Produce has been delivered",
      emoji: "📦",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      actionable: false,
      category: "orders",
      priority: "medium"
    },
    {
      id: "4",
      type: "info",
      title: "New Supplier Available",
      message: "Ocean Fresh Seafood has joined your supplier network",
      emoji: "🐟",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionable: true,
      action: "Connect",
      actionUrl: "/supplier-marketplace",
      category: "suppliers",
      priority: "medium"
    },
    {
      id: "5",
      type: "info",
      title: "AI Recommendation",
      message: "Consider reducing order quantity for Bread Flour to optimize costs",
      emoji: "🤖",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false,
      actionable: true,
      action: "View Details",
      actionUrl: "/analytics",
      category: "system",
      priority: "low"
    }
  ];

  const displayNotifications = notifications || sampleNotifications;

  const filteredNotifications = displayNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'critical':
        return notification.priority === 'critical';
      default:
        return true;
    }
  });

  const unreadCount = displayNotifications.filter(n => !n.read).length;
  const criticalCount = displayNotifications.filter(n => n.priority === 'critical').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'orders':
        return <DollarSign className="h-4 w-4" />;
      case 'suppliers':
        return <Users className="h-4 w-4" />;
      case 'alerts':
        return <AlertTriangle className="h-4 w-4" />;
      case 'system':
        return <Zap className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{displayNotifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({displayNotifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {filter === 'all' && 'All Notifications'}
                  {filter === 'unread' && 'Unread Notifications'}
                  {filter === 'critical' && 'Critical Alerts'}
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsRead.mutate()}
                    disabled={markAllAsRead.isPending}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="text-2xl">{notification.emoji}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {getCategoryIcon(notification.category)}
                              <span>{notification.category}</span>
                              <span>•</span>
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            {notification.actionable && (
                              <Button size="sm" variant="outline" className="text-xs">
                                {notification.action}
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification.mutate(notification.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}