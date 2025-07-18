import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, TrendingUp, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface HealthMetrics {
  stockAccuracy: number;
  wastageRate: number;
  stockoutFrequency: number;
  reorderEfficiency: number;
  overallScore: number;
}

interface FixAction {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  emoji: string;
}

export default function InventoryHealthScore() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ["/api/inventory/health-score"],
  });

  const { data: fixActions } = useQuery({
    queryKey: ["/api/inventory/fix-actions"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🎉";
    if (score >= 60) return "😊";
    return "😰";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium Priority</Badge>;
      default:
        return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = healthData?.overallScore || 75;
  const actions = fixActions || [
    {
      priority: 'high',
      action: 'Reorder Fresh Tomatoes - Only 5 units left',
      impact: 'Prevent stockout and lost sales',
      emoji: '🍅'
    },
    {
      priority: 'high',
      action: 'Review expired items in Dairy section',
      impact: 'Reduce waste by 15%',
      emoji: '🥛'
    },
    {
      priority: 'medium',
      action: 'Update reorder points for seasonal items',
      impact: 'Optimize inventory levels',
      emoji: '📊'
    }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Inventory Health Score
            </CardTitle>
            <CardDescription>
              Overall performance across all metrics
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Fix This
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI-Powered Actions to Improve Your Score</DialogTitle>
                <DialogDescription>
                  Complete these actions to boost your inventory health from {score} to {Math.min(score + 15, 100)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {actions.map((action: FixAction, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{action.emoji}</span>
                        <h4 className="font-semibold">{action.action}</h4>
                      </div>
                      {getPriorityBadge(action.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{action.impact}</p>
                    <Button size="sm" className="w-full">Take Action</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getScoreEmoji(score)}</span>
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">+5</span>
              </div>
              <p className="text-xs text-muted-foreground">vs last week</p>
            </div>
          </div>
          
          <Progress value={score} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stock Accuracy</p>
              <div className="flex items-center gap-2">
                <Progress value={healthData?.stockAccuracy || 85} className="h-2 flex-1" />
                <span className="text-xs font-semibold">{healthData?.stockAccuracy || 85}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Waste Reduction</p>
              <div className="flex items-center gap-2">
                <Progress value={healthData?.wastageRate || 70} className="h-2 flex-1" />
                <span className="text-xs font-semibold">{healthData?.wastageRate || 70}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stockout Prevention</p>
              <div className="flex items-center gap-2">
                <Progress value={healthData?.stockoutFrequency || 75} className="h-2 flex-1" />
                <span className="text-xs font-semibold">{healthData?.stockoutFrequency || 75}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reorder Efficiency</p>
              <div className="flex items-center gap-2">
                <Progress value={healthData?.reorderEfficiency || 80} className="h-2 flex-1" />
                <span className="text-xs font-semibold">{healthData?.reorderEfficiency || 80}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}