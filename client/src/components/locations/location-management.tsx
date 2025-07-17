import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  Package,
  BarChart3,
  Phone,
  Mail,
  Building,
  User,
  Shield,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  type: 'store' | 'warehouse' | 'distribution_center';
  managerId: number;
  manager: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  isActive: boolean;
  stats: {
    totalProducts: number;
    totalValue: number;
    activeUsers: number;
    lastActivity: Date;
  };
}

interface LocationAccess {
  userId: number;
  locationId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  accessLevel: 'read' | 'write' | 'admin';
  grantedAt: Date;
}

const LOCATION_TYPES = [
  { value: 'store', label: 'Store', icon: Building },
  { value: 'warehouse', label: 'Warehouse', icon: Package },
  { value: 'distribution_center', label: 'Distribution Center', icon: BarChart3 }
];

const ACCESS_LEVELS = [
  { value: 'read', label: 'Read Only', color: 'bg-blue-100 text-blue-800' },
  { value: 'write', label: 'Read & Write', color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800' }
];

export default function LocationManagement() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingAccess, setIsEditingAccess] = useState(false);
  const { toast } = useToast();

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    type: 'store' as const,
    managerId: 0
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["/api/locations"],
    queryFn: async (): Promise<Location[]> => {
      // Mock data for demonstration
      return [
        {
          id: 1,
          name: "Main Store",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          phone: "(555) 123-4567",
          email: "main@stocksense.com",
          type: "store",
          managerId: 1,
          manager: {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@stocksense.com"
          },
          isActive: true,
          stats: {
            totalProducts: 245,
            totalValue: 125000,
            activeUsers: 8,
            lastActivity: new Date()
          }
        },
        {
          id: 2,
          name: "Warehouse A",
          address: "456 Industrial Blvd",
          city: "Newark",
          state: "NJ",
          postalCode: "07102",
          phone: "(555) 987-6543",
          email: "warehouse@stocksense.com",
          type: "warehouse",
          managerId: 2,
          manager: {
            id: 2,
            firstName: "Sarah",
            lastName: "Smith",
            email: "sarah.smith@stocksense.com"
          },
          isActive: true,
          stats: {
            totalProducts: 1250,
            totalValue: 850000,
            activeUsers: 12,
            lastActivity: new Date()
          }
        }
      ];
    }
  });

  const { data: locationAccess } = useQuery({
    queryKey: ["/api/locations/access", selectedLocation?.id],
    queryFn: async (): Promise<LocationAccess[]> => {
      if (!selectedLocation) return [];
      // Mock data for demonstration
      return [
        {
          userId: 1,
          locationId: selectedLocation.id,
          user: {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@stocksense.com",
            role: "manager"
          },
          accessLevel: "admin",
          grantedAt: new Date()
        },
        {
          userId: 2,
          locationId: selectedLocation.id,
          user: {
            id: 2,
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@stocksense.com",
            role: "user"
          },
          accessLevel: "write",
          grantedAt: new Date()
        }
      ];
    },
    enabled: !!selectedLocation
  });

  const createLocation = useMutation({
    mutationFn: async (location: typeof newLocation) => {
      return await apiRequest("POST", "/api/locations", location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location Created",
        description: "New location has been added successfully.",
      });
      setIsCreating(false);
      setNewLocation({
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        email: '',
        type: 'store',
        managerId: 0
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateLocationAccess = useMutation({
    mutationFn: async ({ userId, locationId, accessLevel }: { userId: number; locationId: number; accessLevel: string }) => {
      return await apiRequest("PUT", `/api/locations/${locationId}/access/${userId}`, { accessLevel });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations/access"] });
      toast({
        title: "Access Updated",
        description: "User access level has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user access. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getLocationTypeInfo = (type: string) => {
    return LOCATION_TYPES.find(t => t.value === type) || LOCATION_TYPES[0];
  };

  const getAccessLevelInfo = (level: string) => {
    return ACCESS_LEVELS.find(a => a.value === level) || ACCESS_LEVELS[0];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">Manage your business locations and user access</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {locations?.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedLocation?.id === location.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{location.name}</h3>
                            <Badge variant={location.isActive ? "default" : "destructive"}>
                              {location.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {location.city}, {location.state}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {(() => {
                              const typeInfo = getLocationTypeInfo(location.type);
                              const Icon = typeInfo.icon;
                              return (
                                <>
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">{typeInfo.label}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${location.stats.totalValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {location.stats.totalProducts} products
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Location Details */}
        <div className="lg:col-span-2">
          {selectedLocation ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {selectedLocation.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Location Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{selectedLocation.address}</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedLocation.city}, {selectedLocation.state} {selectedLocation.postalCode}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedLocation.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{selectedLocation.email}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Manager</h3>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedLocation.manager.profileImage} />
                          <AvatarFallback>
                            {selectedLocation.manager.firstName[0]}{selectedLocation.manager.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {selectedLocation.manager.firstName} {selectedLocation.manager.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedLocation.manager.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedLocation.stats.totalProducts}
                      </div>
                      <div className="text-sm text-blue-600">Products</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        ${selectedLocation.stats.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Total Value</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {selectedLocation.stats.activeUsers}
                      </div>
                      <div className="text-sm text-purple-600">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700">
                        {selectedLocation.stats.lastActivity.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-orange-600">Last Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      User Access
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAccess(true)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Access
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationAccess?.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={access.user.profileImage} />
                            <AvatarFallback>
                              {access.user.firstName[0]}{access.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {access.user.firstName} {access.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {access.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getAccessLevelInfo(access.accessLevel).color}>
                            {getAccessLevelInfo(access.accessLevel).label}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">No Location Selected</h3>
                  <p className="text-muted-foreground">Select a location to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Location Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Location</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="Enter location name"
                />
              </div>

              <div>
                <Label htmlFor="type">Location Type</Label>
                <Select
                  value={newLocation.type}
                  onValueChange={(value: any) => setNewLocation({ ...newLocation, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newLocation.phone}
                  onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newLocation.email}
                  onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createLocation.mutate(newLocation)}
                  disabled={createLocation.isPending}
                >
                  Create Location
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}