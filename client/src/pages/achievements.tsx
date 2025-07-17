import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { 
  Trophy, 
  Award, 
  Target, 
  Zap, 
  TrendingUp,
  ShieldCheck,
  Star,
  Gift,
  Medal,
  Crown,
  Check,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { AchievementWithProgress, UserStats } from "@shared/schema";

const MOCK_USER_ID = "1";

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

function AchievementCard({ achievement }: { achievement: AchievementWithProgress }) {
  const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;
  const isCompleted = achievement.isCompleted;
  const progressPercentage = Math.min((achievement.progress / (achievement.requirement as any)?.target || 100) * 100, 100);

  return (
    <Card className={`relative overflow-hidden ${isCompleted ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${isCompleted ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-muted'}`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isCompleted ? 'bg-yellow-100 dark:bg-yellow-800' : 'bg-muted'}`}>
              <IconComponent className={`h-5 w-5 ${isCompleted ? 'text-yellow-600 dark:text-yellow-300' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {achievement.name}
                {isCompleted && <Check className="h-4 w-4 text-green-500" />}
              </CardTitle>
              <Badge variant="secondary" className={categoryColors[achievement.category as keyof typeof categoryColors]}>
                {achievement.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{achievement.points} pts</div>
            {isCompleted && (
              <div className="text-xs text-green-600 dark:text-green-400">
                Completed!
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-3">
          {achievement.description}
        </CardDescription>
        
        {!isCompleted && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{achievement.progress} / {(achievement.requirement as any)?.target || 100}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        {isCompleted && achievement.completedAt && (
          <div className="text-xs text-muted-foreground">
            Completed {new Date(achievement.completedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({ stats }: { stats: UserStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">Total Points</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPoints}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAchievements}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base">Current Streak</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak} days</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base">Best Streak</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.longestStreak} days</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: [`/api/achievements/user/${MOCK_USER_ID}`],
    queryFn: () => apiRequest("GET", `/api/achievements/user/${MOCK_USER_ID}`),
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/achievements/stats/${MOCK_USER_ID}`],
    queryFn: () => apiRequest("GET", `/api/achievements/stats/${MOCK_USER_ID}`),
  });

  const filteredAchievements = achievements?.filter((achievement: AchievementWithProgress) =>
    selectedCategory === "all" || achievement.category === selectedCategory
  ) || [];

  const completedAchievements = achievements?.filter((a: AchievementWithProgress) => a.isCompleted) || [];
  const inProgressAchievements = achievements?.filter((a: AchievementWithProgress) => !a.isCompleted && a.progress > 0) || [];
  const lockedAchievements = achievements?.filter((a: AchievementWithProgress) => !a.isCompleted && a.progress === 0) || [];

  const categories = [
    { id: "all", label: "All", icon: Trophy },
    { id: "waste_reduction", label: "Waste Reduction", icon: Target },
    { id: "forecasting", label: "Forecasting", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: ShieldCheck },
    { id: "streak", label: "Streaks", icon: Zap },
    { id: "efficiency", label: "Efficiency", icon: Star },
    { id: "milestone", label: "Milestones", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      <Sidebar />
      
      <main className="md:pl-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Inventory Hero</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and earn achievements for excellent inventory management
            </p>
          </div>

          {stats && <StatsCard stats={stats} />}

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-6">
              {achievementsLoading ? (
                <div className="text-center py-8">Loading achievements...</div>
              ) : (
                <>
                  {completedAchievements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Completed ({completedAchievements.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedAchievements.map((achievement: AchievementWithProgress) => (
                          <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                      </div>
                    </div>
                  )}

                  {inProgressAchievements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        In Progress ({inProgressAchievements.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inProgressAchievements.map((achievement: AchievementWithProgress) => (
                          <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                      </div>
                    </div>
                  )}

                  {lockedAchievements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        Locked ({lockedAchievements.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lockedAchievements.map((achievement: AchievementWithProgress) => (
                          <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredAchievements.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No achievements found for this category.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}