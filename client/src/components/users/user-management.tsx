import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Settings, 
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Crown,
  Key,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  organizationId: number;
  defaultLocationId: number;
  defaultLocation: {
    id: number;
    name: string;
    type: string;
  };
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  locationAccess: {
    locationId: number;
    location: {
      id: number;
      name: string;
      type: string;
    };
    accessLevel: 'read' | 'write' | 'admin';
  }[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const SYSTEM_PERMISSIONS: Permission[] = [
  // Inventory Permissions
  { id: 'inventory.view', name: 'View Inventory', description: 'View inventory levels and product details', category: 'Inventory' },
  { id: 'inventory.create', name: 'Add Products', description: 'Add new products to inventory', category: 'Inventory' },
  { id: 'inventory.update', name: 'Update Inventory', description: 'Update stock levels and product information', category: 'Inventory' },
  { id: 'inventory.delete', name: 'Delete Products', description: 'Remove products from inventory', category: 'Inventory' },
  
  // Orders Permissions
  { id: 'orders.view', name: 'View Orders', description: 'View purchase orders and order history', category: 'Orders' },
  { id: 'orders.create', name: 'Create Orders', description: 'Create new purchase orders', category: 'Orders' },
  { id: 'orders.approve', name: 'Approve Orders', description: 'Approve pending purchase orders', category: 'Orders' },
  { id: 'orders.cancel', name: 'Cancel Orders', description: 'Cancel existing orders', category: 'Orders' },
  
  // Analytics Permissions
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reporting features', category: 'Analytics' },
  { id: 'analytics.export', name: 'Export Reports', description: 'Export analytics data and reports', category: 'Analytics' },
  { id: 'analytics.advanced', name: 'Advanced Analytics', description: 'Access advanced analytics features', category: 'Analytics' },
  
  // User Management Permissions
  { id: 'users.view', name: 'View Users', description: 'View user list and basic information', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Add new users to the system', category: 'Users' },
  { id: 'users.update', name: 'Update Users', description: 'Edit user information and settings', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove users from the system', category: 'Users' },
  
  // Location Permissions
  { id: 'locations.view', name: 'View Locations', description: 'View location information', category: 'Locations' },
  { id: 'locations.create', name: 'Create Locations', description: 'Add new locations', category: 'Locations' },
  { id: 'locations.update', name: 'Update Locations', description: 'Edit location information', category: 'Locations' },
  { id: 'locations.delete', name: 'Delete Locations', description: 'Remove locations', category: 'Locations' },
  
  // System Permissions
  { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'System' },
  { id: 'system.backup', name: 'Backup Data', description: 'Create and manage data backups', category: 'System' },
  { id: 'system.audit', name: 'Audit Logs', description: 'View system audit logs', category: 'System' }
];

const ROLE_BADGES = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-800', icon: Crown },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800', icon: Shield },
  user: { label: 'User', color: 'bg-green-100 text-green-800', icon: User },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-800', icon: Eye }
};

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'user' as const,
    defaultLocationId: 0,
    permissions: [] as string[]
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async (): Promise<User[]> => {
      // Mock data for demonstration
      return [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@stocksense.com",
          username: "john.doe",
          role: "admin",
          permissions: ["inventory.view", "inventory.create", "inventory.update", "users.view", "users.create"],
          organizationId: 1,
          defaultLocationId: 1,
          defaultLocation: {
            id: 1,
            name: "Main Store",
            type: "store"
          },
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          locationAccess: [
            {
              locationId: 1,
              location: { id: 1, name: "Main Store", type: "store" },
              accessLevel: "admin"
            }
          ]
        },
        {
          id: 2,
          firstName: "Sarah",
          lastName: "Smith",
          email: "sarah.smith@stocksense.com",
          username: "sarah.smith",
          role: "manager",
          permissions: ["inventory.view", "inventory.update", "orders.view", "orders.create"],
          organizationId: 1,
          defaultLocationId: 2,
          defaultLocation: {
            id: 2,
            name: "Warehouse A",
            type: "warehouse"
          },
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          locationAccess: [
            {
              locationId: 2,
              location: { id: 2, name: "Warehouse A", type: "warehouse" },
              accessLevel: "admin"
            }
          ]
        }
      ];
    }
  });

  const { data: roles } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async (): Promise<Role[]> => {
      // Mock data for demonstration
      return [
        {
          id: 1,
          name: "Administrator",
          description: "Full system access with all permissions",
          permissions: SYSTEM_PERMISSIONS.map(p => p.id),
          isSystemRole: true
        },
        {
          id: 2,
          name: "Store Manager",
          description: "Manage store operations and inventory",
          permissions: ["inventory.view", "inventory.create", "inventory.update", "orders.view", "orders.create", "analytics.view"],
          isSystemRole: true
        },
        {
          id: 3,
          name: "Warehouse Manager",
          description: "Manage warehouse operations and logistics",
          permissions: ["inventory.view", "inventory.update", "orders.view", "orders.create", "orders.approve", "analytics.view"],
          isSystemRole: true
        },
        {
          id: 4,
          name: "Employee",
          description: "Basic inventory access for daily operations",
          permissions: ["inventory.view", "inventory.update", "orders.view"],
          isSystemRole: true
        }
      ];
    }
  });

  const createUser = useMutation({
    mutationFn: async (user: typeof newUser) => {
      return await apiRequest("POST", "/api/users", user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Created",
        description: "New user has been added successfully.",
      });
      setIsCreating(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        role: 'user',
        defaultLocationId: 0,
        permissions: []
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateUserPermissions = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number; permissions: string[] }) => {
      return await apiRequest("PUT", `/api/users/${userId}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Permissions Updated",
        description: "User permissions have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    }
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getRoleBadge = (role: string) => {
    return ROLE_BADGES[role as keyof typeof ROLE_BADGES] || ROLE_BADGES.user;
  };

  const getPermissionsByCategory = () => {
    return SYSTEM_PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedUser) return;
    
    const newPermissions = selectedUser.permissions.includes(permissionId)
      ? selectedUser.permissions.filter(p => p !== permissionId)
      : [...selectedUser.permissions, permissionId];
    
    setSelectedUser({ ...selectedUser, permissions: newPermissions });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Users ({users?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {users?.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedUser?.id === user.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <Badge variant={user.isActive ? "default" : "destructive"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                {(() => {
                                  const roleBadge = getRoleBadge(user.role);
                                  const Icon = roleBadge.icon;
                                  return (
                                    <>
                                      <Icon className="h-4 w-4 text-gray-500" />
                                      <Badge className={roleBadge.color}>
                                        {roleBadge.label}
                                      </Badge>
                                    </>
                                  );
                                })()}
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

            {/* User Details */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          {selectedUser.firstName} {selectedUser.lastName}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedUser.isActive}
                            onCheckedChange={(checked) => 
                              toggleUserStatus.mutate({ userId: selectedUser.id, isActive: checked })
                            }
                          />
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">User Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{selectedUser.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{selectedUser.username}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>{selectedUser.defaultLocation.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>Last login: {selectedUser.lastLogin.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-3">Role & Permissions</h3>
                          <div className="space-y-3">
                            {(() => {
                              const roleBadge = getRoleBadge(selectedUser.role);
                              const Icon = roleBadge.icon;
                              return (
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <Badge className={roleBadge.color}>
                                    {roleBadge.label}
                                  </Badge>
                                </div>
                              );
                            })()}
                            <div className="flex items-center space-x-2">
                              <Key className="h-4 w-4 text-gray-500" />
                              <span>{selectedUser.permissions.length} permissions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          Permissions
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingPermissions(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                          <div key={category}>
                            <h4 className="font-medium mb-2">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <CheckCircle className={`h-4 w-4 ${
                                    selectedUser.permissions.includes(permission.id)
                                      ? 'text-green-500'
                                      : 'text-gray-300'
                                  }`} />
                                  <span className={`text-sm ${
                                    selectedUser.permissions.includes(permission.id)
                                      ? 'text-gray-900'
                                      : 'text-gray-500'
                                  }`}>
                                    {permission.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Location Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedUser.locationAccess.map((access) => (
                          <div key={access.locationId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{access.location.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {access.location.type}
                              </div>
                            </div>
                            <Badge variant={access.accessLevel === 'admin' ? 'default' : 'secondary'}>
                              {access.accessLevel}
                            </Badge>
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
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600">No User Selected</h3>
                      <p className="text-muted-foreground">Select a user to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles?.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                        {role.isSystemRole ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Permissions:</span>
                        <span className="font-medium">{role.permissions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" disabled={role.isSystemRole}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="p-4 border rounded-lg">
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Modal */}
      {isEditingPermissions && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Permissions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingPermissions(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3">{category}</h3>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={selectedUser.permissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={permission.id} className="font-medium">
                            {permission.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditingPermissions(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateUserPermissions.mutate({
                    userId: selectedUser.id,
                    permissions: selectedUser.permissions
                  });
                  setIsEditingPermissions(false);
                }}
                disabled={updateUserPermissions.isPending}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}