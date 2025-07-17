import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface AnimatedBarChartProps {
  title: string;
  data: BarData[];
  maxValue?: number;
  className?: string;
  animationDelay?: number;
  height?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  horizontal?: boolean;
}

export default function AnimatedBarChart({
  title,
  data,
  maxValue,
  className,
  animationDelay = 0,
  height = 300,
  showValues = true,
  showPercentages = false,
  horizontal = false
}: AnimatedBarChartProps) {
  const [animatedData, setAnimatedData] = useState<BarData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const defaultColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [data, isVisible]);

  if (!data || data.length === 0) {
    return null;
  }

  const max = maxValue || Math.max(...data.map(d => d.value));
  const chartHeight = height - 100; // Account for labels and padding
  const barWidth = horizontal ? chartHeight / data.length - 20 : (400 - 80) / data.length - 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6,
        delay: animationDelay / 1000,
        type: "spring",
        stiffness: 100
      }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {!horizontal ? (
              // Vertical bars
              <div className="flex items-end justify-between space-x-2" style={{ height: chartHeight }}>
                {data.map((item, index) => {
                  const barHeight = (item.value / max) * (chartHeight - 40);
                  const color = item.color || defaultColors[index % defaultColors.length];

                  return (
                    <div key={item.label} className="flex flex-col items-center flex-1">
                      <div className="relative flex flex-col items-center justify-end" style={{ height: chartHeight - 40 }}>
                        {/* Value label */}
                        {showValues && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                            className="text-xs font-medium text-muted-foreground mb-1"
                          >
                            {item.value.toLocaleString()}
                            {showPercentages && item.percentage && (
                              <span className="ml-1">({item.percentage}%)</span>
                            )}
                          </motion.div>
                        )}
                        
                        {/* Bar */}
                        <motion.div
                          className="relative rounded-t-md"
                          style={{ 
                            backgroundColor: color,
                            width: Math.max(barWidth, 20)
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: barHeight }}
                          transition={{ 
                            delay: 0.5 + index * 0.1, 
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100
                          }}
                        >
                          {/* Animated gradient overlay */}
                          <motion.div
                            className="absolute inset-0 rounded-t-md"
                            style={{
                              background: `linear-gradient(to top, ${color}, ${color}80)`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          />
                          
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 rounded-t-md"
                            style={{
                              background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`
                            }}
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ 
                              delay: 1 + index * 0.1,
                              duration: 0.8,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      {/* Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.05, duration: 0.3 }}
                        className="text-xs text-muted-foreground text-center mt-2 max-w-full"
                      >
                        <div className="truncate">{item.label}</div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Horizontal bars
              <div className="space-y-4">
                {data.map((item, index) => {
                  const barWidth = (item.value / max) * (400 - 120);
                  const color = item.color || defaultColors[index % defaultColors.length];

                  return (
                    <div key={item.label} className="flex items-center space-x-3">
                      {/* Label */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                        className="text-sm font-medium text-muted-foreground w-20 text-right"
                      >
                        {item.label}
                      </motion.div>
                      
                      {/* Bar container */}
                      <div className="flex-1 relative">
                        <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          {/* Bar */}
                          <motion.div
                            className="h-full rounded-full relative"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: barWidth }}
                            transition={{ 
                              delay: 0.5 + index * 0.1, 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 100
                            }}
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`
                              }}
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ 
                                delay: 1 + index * 0.1,
                                duration: 0.8,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Value label */}
                      {showValues && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                          className="text-sm font-medium text-foreground w-16 text-left"
                        >
                          {item.value.toLocaleString()}
                          {showPercentages && item.percentage && (
                            <div className="text-xs text-muted-foreground">
                              {item.percentage}%
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}