import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, ArrowRight, Target, ShieldCheck, Zap } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { AchievementWithProgress, UserStats } from "@shared/schema";

const MOCK_USER_ID = "1";

const categoryIcons = {
  waste_reduction: Target,
  forecasting: TrendingUp,
  inventory: ShieldCheck,
  streak: Zap,
  efficiency: Star,
  milestone: Trophy,
} as const;

export default function AchievementDashboard() {
  const { data: achievements } = useQuery({
    queryKey: [`/api/achievements/user/${MOCK_USER_ID}`],
    queryFn: () => apiRequest("GET", `/api/achievements/user/${MOCK_USER_ID}`),
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/achievements/stats/${MOCK_USER_ID}`],
    queryFn: () => apiRequest("GET", `/api/achievements/stats/${MOCK_USER_ID}`),
  });

  const recentAchievements = achievements?.filter((a: AchievementWithProgress) => a.isCompleted).slice(0, 3) || [];
  const inProgressAchievements = achievements?.filter((a: AchievementWithProgress) => !a.isCompleted && a.progress > 0).slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-sm">Total Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPoints || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-sm">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAchievements || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-sm">Current Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.currentStreak || 0} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.map((achievement: AchievementWithProgress) => {
              const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
                    <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    +{achievement.points} pts
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressAchievements.map((achievement: AchievementWithProgress) => {
              const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy;
              const progressPercentage = Math.min((achievement.progress / (achievement.requirement as any)?.target || 100) * 100, 100);
              
              return (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    </div>
                    <Badge variant="outline">
                      {achievement.progress} / {(achievement.requirement as any)?.target || 100}
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* View All Button */}
      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/achievements">
            View All Achievements
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}