import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Truck, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#dashboard", current: true },
  { name: "Inventory", icon: Package, href: "#inventory", current: false },
  { name: "Analytics", icon: BarChart3, href: "#analytics", current: false },
  { name: "Suppliers", icon: Truck, href: "#suppliers", current: false },
  { name: "Settings", icon: Settings, href: "#settings", current: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-surface border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    item.current && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <a href={item.href}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
