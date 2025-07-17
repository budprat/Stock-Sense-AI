import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  predicted?: boolean;
}

interface AnimatedLineChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  predictedColor?: string;
  className?: string;
  animationDelay?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showArea?: boolean;
}

export default function AnimatedLineChart({
  title,
  data,
  color = "#3b82f6",
  predictedColor = "#94a3b8",
  className,
  animationDelay = 0,
  height = 200,
  showGrid = true,
  showDots = true,
  showArea = true
}: AnimatedLineChartProps) {
  const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const width = 400;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

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

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  const actualData = data.filter(d => !d.predicted);
  const predictedData = data.filter(d => d.predicted);

  const createPath = (points: DataPoint[]) => {
    if (points.length === 0) return "";
    
    const startIndex = data.findIndex(d => d === points[0]);
    let path = `M ${getX(startIndex)} ${getY(points[0].value)}`;
    
    for (let i = 1; i < points.length; i++) {
      const currentIndex = data.findIndex(d => d === points[i]);
      path += ` L ${getX(currentIndex)} ${getY(points[i].value)}`;
    }
    
    return path;
  };

  const createAreaPath = (points: DataPoint[]) => {
    if (points.length === 0) return "";
    
    const startIndex = data.findIndex(d => d === points[0]);
    let path = `M ${getX(startIndex)} ${getY(points[0].value)}`;
    
    for (let i = 1; i < points.length; i++) {
      const currentIndex = data.findIndex(d => d === points[i]);
      path += ` L ${getX(currentIndex)} ${getY(points[i].value)}`;
    }
    
    // Close the area to the bottom
    const lastIndex = data.findIndex(d => d === points[points.length - 1]);
    path += ` L ${getX(lastIndex)} ${padding + chartHeight}`;
    path += ` L ${getX(startIndex)} ${padding + chartHeight}`;
    path += ` Z`;
    
    return path;
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
              {predictedData.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: predictedColor }}></div>
                  <span className="text-sm text-muted-foreground">Predicted</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <svg width={width} height={height} className="overflow-visible">
              {/* Grid lines */}
              {showGrid && (
                <g className="opacity-20">
                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                    <line
                      key={`h-${index}`}
                      x1={padding}
                      y1={padding + chartHeight * ratio}
                      x2={padding + chartWidth}
                      y2={padding + chartHeight * ratio}
                      stroke="currentColor"
                      strokeWidth={1}
                    />
                  ))}
                  {/* Vertical grid lines */}
                  {data.map((_, index) => (
                    <line
                      key={`v-${index}`}
                      x1={getX(index)}
                      y1={padding}
                      x2={getX(index)}
                      y2={padding + chartHeight}
                      stroke="currentColor"
                      strokeWidth={1}
                    />
                  ))}
                </g>
              )}

              {/* Area fill for actual data */}
              {showArea && actualData.length > 0 && (
                <motion.path
                  d={createAreaPath(actualData)}
                  fill={`url(#areaGradient-${title.replace(/\s+/g, '')})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              )}

              {/* Gradient definition */}
              <defs>
                <linearGradient id={`areaGradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                </linearGradient>
              </defs>

              {/* Line for actual data */}
              {actualData.length > 0 && (
                <motion.path
                  d={createPath(actualData)}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
                />
              )}

              {/* Line for predicted data */}
              {predictedData.length > 0 && (
                <motion.path
                  d={createPath(predictedData)}
                  fill="none"
                  stroke={predictedColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
                />
              )}

              {/* Data points */}
              {showDots && animatedData.map((point, index) => (
                <motion.circle
                  key={`${point.label}-${index}`}
                  cx={getX(index)}
                  cy={getY(point.value)}
                  r={4}
                  fill={point.predicted ? predictedColor : color}
                  stroke="white"
                  strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.5 + index * 0.1, 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="cursor-pointer hover:scale-125 transition-transform"
                />
              ))}

              {/* Value labels on hover */}
              <AnimatePresence>
                {animatedData.map((point, index) => (
                  <motion.g
                    key={`label-${point.label}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                  >
                    <text
                      x={getX(index)}
                      y={getY(point.value) - 12}
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground font-medium"
                    >
                      {point.value.toLocaleString()}
                    </text>
                  </motion.g>
                ))}
              </AnimatePresence>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-10">
              {data.map((point, index) => (
                <motion.div
                  key={`x-label-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.05, duration: 0.3 }}
                  className="text-xs text-muted-foreground text-center"
                >
                  {point.label}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}