import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedProgressRingProps {
  title: string;
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  className?: string;
  animationDelay?: number;
  showPercentage?: boolean;
  icon?: React.ReactNode;
}

export default function AnimatedProgressRing({
  title,
  value,
  maxValue,
  label,
  color = "#3b82f6",
  backgroundColor = "#e5e7eb",
  size = 'md',
  strokeWidth,
  className,
  animationDelay = 0,
  showPercentage = true,
  icon
}: AnimatedProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const sizeConfig = {
    sm: { radius: 30, defaultStrokeWidth: 4 },
    md: { radius: 45, defaultStrokeWidth: 6 },
    lg: { radius: 60, defaultStrokeWidth: 8 }
  };

  const { radius, defaultStrokeWidth } = sizeConfig[size];
  const finalStrokeWidth = strokeWidth || defaultStrokeWidth;
  const normalizedRadius = radius - finalStrokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [value, isVisible]);

  const strokeDasharray = circumference;
  const animatedPercentage = (animatedValue / maxValue) * 100;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {icon}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg
                width={radius * 2}
                height={radius * 2}
                className="transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  fill="none"
                  stroke={backgroundColor}
                  strokeWidth={finalStrokeWidth}
                />
                
                {/* Progress circle */}
                <motion.circle
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth={finalStrokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Animated glow effect */}
                <motion.circle
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth={finalStrokeWidth + 2}
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  opacity={0.3}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-foreground">
                    {animatedValue.toLocaleString()}
                  </div>
                  {showPercentage && (
                    <div className="text-xs text-muted-foreground">
                      {animatedPercentage.toFixed(1)}%
                    </div>
                  )}
                  {label && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {label}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.3 }}
            className="mt-4 flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>0</span>
            <span className="font-medium">
              {animatedValue.toLocaleString()} / {maxValue.toLocaleString()}
            </span>
            <span>{maxValue.toLocaleString()}</span>
          </motion.div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.3 }}
            className="mt-2 w-full bg-gray-200 rounded-full h-1"
          >
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${animatedPercentage}%` }}
              transition={{ delay: 1.6, duration: 0.8, ease: "easeInOut" }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}