import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface AnimatedDonutChartProps {
  title: string;
  data: DonutSegment[];
  centerValue?: number;
  centerLabel?: string;
  className?: string;
  animationDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AnimatedDonutChart({
  title,
  data,
  centerValue,
  centerLabel,
  className,
  animationDelay = 0,
  size = 'md'
}: AnimatedDonutChartProps) {
  const [animatedData, setAnimatedData] = useState<DonutSegment[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const sizeConfig = {
    sm: { radius: 40, strokeWidth: 8, centerRadius: 24 },
    md: { radius: 60, strokeWidth: 12, centerRadius: 36 },
    lg: { radius: 80, strokeWidth: 16, centerRadius: 48 }
  };

  const { radius, strokeWidth, centerRadius } = sizeConfig[size];
  const circumference = 2 * Math.PI * radius;

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

  const createSegmentPath = (startAngle: number, endAngle: number) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(start);
    const y1 = radius + radius * Math.sin(start);
    const x2 = radius + radius * Math.cos(end);
    const y2 = radius + radius * Math.sin(end);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  let cumulativeAngle = -90; // Start from top

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
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
          <div className="flex items-center justify-between">
            <div className="relative">
              <svg
                width={radius * 2 + strokeWidth}
                height={radius * 2 + strokeWidth}
                className="transform rotate-0"
              >
                {/* Background circle */}
                <circle
                  cx={radius + strokeWidth / 2}
                  cy={radius + strokeWidth / 2}
                  r={radius}
                  fill="none"
                  stroke="rgb(229, 231, 235)"
                  strokeWidth={strokeWidth}
                />

                {/* Animated segments */}
                <AnimatePresence>
                  {animatedData.map((segment, index) => {
                    const segmentAngle = (segment.percentage / 100) * 360;
                    const startAngle = cumulativeAngle;
                    const endAngle = cumulativeAngle + segmentAngle;
                    
                    // Calculate stroke-dasharray for circular progress
                    const segmentLength = (segmentAngle / 360) * circumference;
                    const segmentStartOffset = (startAngle / 360) * circumference;
                    
                    const result = (
                      <motion.circle
                        key={segment.label}
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - segmentLength}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - segmentLength }}
                        transition={{ 
                          duration: 1.5,
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                        style={{
                          transformOrigin: '50% 50%',
                          transform: `rotate(${startAngle + 90}deg)`
                        }}
                      />
                    );
                    
                    cumulativeAngle = endAngle;
                    return result;
                  })}
                </AnimatePresence>

                {/* Center content */}
                {centerValue !== undefined && (
                  <g>
                    <circle
                      cx={radius + strokeWidth / 2}
                      cy={radius + strokeWidth / 2}
                      r={centerRadius}
                      fill="white"
                      stroke="rgb(229, 231, 235)"
                      strokeWidth={1}
                    />
                    <motion.text
                      x={radius + strokeWidth / 2}
                      y={radius + strokeWidth / 2 - 5}
                      textAnchor="middle"
                      className="text-2xl font-bold fill-foreground"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      {centerValue.toLocaleString()}
                    </motion.text>
                    {centerLabel && (
                      <motion.text
                        x={radius + strokeWidth / 2}
                        y={radius + strokeWidth / 2 + 12}
                        textAnchor="middle"
                        className="text-xs fill-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                      >
                        {centerLabel}
                      </motion.text>
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="ml-6 space-y-3">
              {data.map((segment, index) => (
                <motion.div
                  key={segment.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: animationDelay / 1000 + index * 0.1, duration: 0.3 }}
                  className="flex items-center space-x-3"
                >
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: animationDelay / 1000 + index * 0.1 + 0.2, duration: 0.3 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {segment.label}
                      </p>
                      <Badge variant="secondary" className="ml-2">
                        {segment.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {segment.value.toLocaleString()} items
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}