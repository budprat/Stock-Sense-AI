import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  status?: 'good' | 'warning' | 'danger';
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  animationDelay?: number;
}

export default function AnimatedMetricCard({
  title,
  value,
  previousValue,
  unit = "",
  trend,
  trendPercentage,
  status = 'good',
  icon,
  description,
  className,
  animationDelay = 0
}: AnimatedMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(previousValue || 0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [value, isVisible]);

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        delay: animationDelay / 1000,
        type: "spring",
        stiffness: 100
      }}
      className={className}
    >
      <Card className={cn("relative overflow-hidden", getStatusColor())}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <motion.div
                key={displayValue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-foreground"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayValue.toLocaleString()}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
              {unit && (
                <span className="text-sm text-muted-foreground font-medium">
                  {unit}
                </span>
              )}
            </div>

            {trend && trendPercentage !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center space-x-1"
              >
                {getTrendIcon()}
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs last period
                </span>
              </motion.div>
            )}

            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="text-xs text-muted-foreground"
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Animated background pulse for status */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: status === 'good' ? 'radial-gradient(circle, #10b981, transparent)' :
                         status === 'warning' ? 'radial-gradient(circle, #f59e0b, transparent)' :
                         'radial-gradient(circle, #ef4444, transparent)'
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}