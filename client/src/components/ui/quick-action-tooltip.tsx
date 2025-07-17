import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Eye, 
  ShoppingCart, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Calculator,
  BarChart3,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  FileText,
  Download,
  Upload,
  Share2,
  BookOpen,
  Target,
  Zap
} from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline';
  disabled?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
  };
}

interface QuickActionTooltipProps {
  actions: QuickAction[];
  trigger?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export default function QuickActionTooltip({ 
  actions, 
  trigger, 
  side = 'top',
  align = 'center',
  className 
}: QuickActionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 hover:bg-gray-100 ${className}`}
            >
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Settings className="h-4 w-4" />
              </motion.div>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="p-2 max-w-xs bg-white border shadow-lg rounded-lg"
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 gap-1"
            >
              {actions.map((action, index) => (
                <div key={action.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant={action.variant || 'ghost'}
                      size="sm"
                      onClick={() => {
                        action.action();
                        setIsOpen(false);
                      }}
                      disabled={action.disabled}
                      className="w-full justify-start h-8 px-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          {action.icon}
                          <span className="text-sm">{action.label}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {action.badge && (
                            <Badge
                              variant={action.badge.variant}
                              className="text-xs h-4 px-1"
                            >
                              {action.badge.text}
                            </Badge>
                          )}
                          {action.shortcut && (
                            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                              {action.shortcut}
                            </kbd>
                          )}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                  {index < actions.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined action sets for common use cases
export const inventoryActions: QuickAction[] = [
  {
    id: 'view-details',
    label: 'View Details',
    icon: <Eye className="h-4 w-4" />,
    shortcut: '⌘D',
    action: () => console.log('View details'),
  },
  {
    id: 'edit-item',
    label: 'Edit Item',
    icon: <Edit className="h-4 w-4" />,
    shortcut: '⌘E',
    action: () => console.log('Edit item'),
  },
  {
    id: 'reorder',
    label: 'Reorder Now',
    icon: <ShoppingCart className="h-4 w-4" />,
    shortcut: '⌘R',
    action: () => console.log('Reorder'),
    badge: {
      text: 'Low Stock',
      variant: 'destructive'
    }
  },
  {
    id: 'adjust-stock',
    label: 'Adjust Stock',
    icon: <Calculator className="h-4 w-4" />,
    action: () => console.log('Adjust stock'),
  },
  {
    id: 'view-analytics',
    label: 'View Analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    action: () => console.log('View analytics'),
  },
  {
    id: 'delete',
    label: 'Delete Item',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    action: () => console.log('Delete item'),
  },
];

export const dashboardActions: QuickAction[] = [
  {
    id: 'refresh-data',
    label: 'Refresh Data',
    icon: <RefreshCw className="h-4 w-4" />,
    shortcut: '⌘R',
    action: () => console.log('Refresh data'),
  },
  {
    id: 'export-report',
    label: 'Export Report',
    icon: <Download className="h-4 w-4" />,
    shortcut: '⌘⇧E',
    action: () => console.log('Export report'),
  },
  {
    id: 'import-data',
    label: 'Import Data',
    icon: <Upload className="h-4 w-4" />,
    action: () => console.log('Import data'),
  },
  {
    id: 'share-dashboard',
    label: 'Share Dashboard',
    icon: <Share2 className="h-4 w-4" />,
    action: () => console.log('Share dashboard'),
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    icon: <Zap className="h-4 w-4" />,
    action: () => console.log('AI insights'),
    badge: {
      text: 'New',
      variant: 'secondary'
    }
  },
];

export const productActions: QuickAction[] = [
  {
    id: 'add-product',
    label: 'Add Product',
    icon: <Plus className="h-4 w-4" />,
    shortcut: '⌘N',
    action: () => console.log('Add product'),
  },
  {
    id: 'bulk-edit',
    label: 'Bulk Edit',
    icon: <Edit className="h-4 w-4" />,
    action: () => console.log('Bulk edit'),
  },
  {
    id: 'price-update',
    label: 'Update Prices',
    icon: <Target className="h-4 w-4" />,
    action: () => console.log('Update prices'),
  },
  {
    id: 'category-manage',
    label: 'Manage Categories',
    icon: <BookOpen className="h-4 w-4" />,
    action: () => console.log('Manage categories'),
  },
];

export const supplierActions: QuickAction[] = [
  {
    id: 'contact-supplier',
    label: 'Contact Supplier',
    icon: <Share2 className="h-4 w-4" />,
    action: () => console.log('Contact supplier'),
  },
  {
    id: 'view-orders',
    label: 'View Orders',
    icon: <FileText className="h-4 w-4" />,
    action: () => console.log('View orders'),
  },
  {
    id: 'performance-report',
    label: 'Performance Report',
    icon: <TrendingUp className="h-4 w-4" />,
    action: () => console.log('Performance report'),
  },
  {
    id: 'new-order',
    label: 'New Order',
    icon: <ShoppingCart className="h-4 w-4" />,
    action: () => console.log('New order'),
  },
];