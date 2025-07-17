import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Truck, 
  Settings,
  FileText,
  MapPin,
  Users
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Suppliers", icon: Truck, href: "/suppliers" },
  { name: "Locations", icon: MapPin, href: "/locations" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-surface border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
