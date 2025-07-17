import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X, LayoutDashboard, Package, BarChart3, Truck, Settings, FileText, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden fixed top-4 left-4 z-40">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-semibold text-primary">Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 rounded-none",
                  isActive && "bg-primary text-primary-foreground border-l-4 border-primary"
                )}
                asChild
              >
                <Link href={item.href} onClick={() => setIsOpen(false)}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
