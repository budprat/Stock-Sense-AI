import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, X, Star, Zap, Target, TrendingUp, ShieldCheck, Crown } from "lucide-react";
import type { Achievement } from "@shared/schema";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const categoryIcons = {
  waste_reduction: Target,
  forecasting: TrendingUp,
  inventory: ShieldCheck,
  streak: Zap,
  efficiency: Star,
  milestone: Crown,
} as const;

const categoryColors = {
  waste_reduction: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  forecasting: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  inventory: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  streak: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  efficiency: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
  milestone: "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100",
} as const;

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
                    <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Achievement Unlocked!
                    </CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShow(false);
                    setTimeout(onClose, 300);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
                  <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{achievement.name}</div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${categoryColors[achievement.category as keyof typeof categoryColors]}`}
                  >
                    {achievement.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <CardDescription className="text-sm mb-3">
                {achievement.description}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">+{achievement.points} points</span>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}