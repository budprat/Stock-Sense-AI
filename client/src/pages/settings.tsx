import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/app-layout";
import { Settings as SettingsIcon, User, Bell, Shield, Database, HelpCircle, Play, Phone, Eye, Zap, Check } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expirationAlerts, setExpirationAlerts] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [largeButtons, setLargeButtons] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsTime, setSmsTime] = useState("08:00");
  const { restartOnboarding } = useOnboarding();
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and system configuration
        </p>
      </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" placeholder="Your Restaurant or Store" />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Profile</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for important updates
                    </p>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={setNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when inventory falls below reorder points
                    </p>
                  </div>
                  <Switch 
                    checked={lowStockAlerts} 
                    onCheckedChange={setLowStockAlerts}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Expiration Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for items approaching expiration
                    </p>
                  </div>
                  <Switch 
                    checked={expirationAlerts} 
                    onCheckedChange={setExpirationAlerts}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered inventory suggestions
                    </p>
                  </div>
                  <Switch 
                    checked={aiRecommendations} 
                    onCheckedChange={setAiRecommendations}
                  />
                </div>
                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Change Password</Button>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                      <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataRetention">Data Retention Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save System Settings</Button>
              </CardContent>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Accessibility Settings
                  </span>
                  <Badge variant="secondary">For Everyone</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Large Button Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Make buttons and text 50% larger for easier viewing
                    </p>
                  </div>
                  <Switch 
                    checked={largeButtons} 
                    onCheckedChange={(checked) => {
                      setLargeButtons(checked);
                      document.documentElement.classList.toggle('large-ui', checked);
                      toast({
                        title: checked ? "Large Button Mode Enabled" : "Large Button Mode Disabled",
                        description: checked ? "UI elements are now larger and easier to click" : "UI returned to normal size",
                      });
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">High Contrast Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch 
                    checked={highContrast} 
                    onCheckedChange={(checked) => {
                      setHighContrast(checked);
                      document.documentElement.classList.toggle('high-contrast', checked);
                    }}
                  />
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Pro Tip: Use keyboard shortcuts
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Press <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-background rounded text-xs">+</kbd> to zoom in
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SMS Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    SMS Daily Summary
                  </span>
                  {smsEnabled && <Badge variant="default">Active</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Enable Daily SMS Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get a summary of low stock items every morning
                    </p>
                  </div>
                  <Switch 
                    checked={smsEnabled} 
                    onCheckedChange={setSmsEnabled}
                  />
                </div>
                
                {smsEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Standard SMS rates may apply
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smsTime">Delivery Time</Label>
                      <Select value={smsTime} onValueChange={setSmsTime}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-4 bg-accent/50 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Sample Message:</p>
                      <p className="text-xs font-mono">
                        StockSense Alert: You're low on 3 items. 
                        Fresh Tomatoes (5 left), 
                        Milk 2% (8 left), 
                        Bread (3 left). 
                        Tap to reorder: stocksense.app/r/12345
                      </p>
                    </div>
                  </>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: smsEnabled ? "SMS Updates Saved" : "Please Enable SMS First",
                      description: smsEnabled ? "You'll receive daily summaries at " + smsTime : "Toggle the switch above to enable SMS updates",
                    });
                  }}
                >
                  {smsEnabled ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save SMS Settings
                    </>
                  ) : (
                    "Enable SMS to Continue"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    View Documentation
                  </Button>
                  <Button variant="outline">
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      restartOnboarding();
                      toast({
                        title: "Tutorial Restarted",
                        description: "The onboarding tutorial has been restarted. Follow the highlighted steps to learn about StockSense.",
                      });
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Restart Tutorial
                  </Button>
                  <Button variant="outline">
                    Report a Bug
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Version 1.0.0</p>
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
    </AppLayout>
  );
}