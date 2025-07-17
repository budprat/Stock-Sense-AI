import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  content: React.ReactNode;
  action?: {
    type: 'click' | 'highlight' | 'input';
    text: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to StockSense",
    description: "Your AI-powered inventory management platform",
    target: "body",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Let's take a quick tour to get you started with StockSense. This tutorial will show you the key features that will help you:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Reduce inventory waste by 20-30%
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Get AI-powered recommendations
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Track inventory across multiple locations
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "Get an overview of your inventory health",
    target: "[data-tour='dashboard']",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          The dashboard shows you critical inventory alerts and key metrics at a glance.
        </p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Pro Tip:</p>
          <p className="text-sm text-blue-800">
            Check your dashboard every morning to stay on top of urgent inventory needs.
          </p>
        </div>
      </div>
    ),
    action: {
      type: 'highlight',
      text: 'Notice the key metrics and alerts'
    }
  },
  {
    id: "inventory",
    title: "Inventory Management",
    description: "Track your stock levels and get reorder alerts",
    target: "[data-tour='inventory']",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          View all your inventory items with real-time stock levels and health indicators.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Green: Healthy stock levels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Yellow: Low stock - consider reordering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Red: Out of stock - urgent action needed</span>
          </div>
        </div>
      </div>
    ),
    action: {
      type: 'click',
      text: 'Click to explore inventory'
    }
  },
  {
    id: "analytics",
    title: "AI-Powered Analytics",
    description: "Get insights from demand forecasting and ABC analysis",
    target: "[data-tour='analytics']",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Our AI analyzes your sales patterns to predict future demand and optimize your inventory.
        </p>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-purple-900">AI Features:</p>
          <ul className="text-sm text-purple-800 mt-1 space-y-1">
            <li>• Demand forecasting with 85% accuracy</li>
            <li>• ABC analysis for item prioritization</li>
            <li>• Seasonal trend detection</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "recommendations",
    title: "Smart Recommendations",
    description: "Get AI suggestions for optimal inventory management",
    target: "[data-tour='recommendations']",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Our AI assistant provides personalized recommendations based on your business patterns.
        </p>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-900">You'll get suggestions for:</p>
          <ul className="text-sm text-green-800 mt-1 space-y-1">
            <li>• When to reorder items</li>
            <li>• Optimal order quantities</li>
            <li>• Items to discontinue</li>
            <li>• Seasonal preparation</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start managing your inventory like a pro",
    target: "body",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Congratulations! You've completed the StockSense onboarding tutorial.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
          <ul className="text-sm space-y-1">
            <li>• Add your first products to inventory</li>
            <li>• Set up your suppliers</li>
            <li>• Configure reorder points</li>
            <li>• Explore the analytics dashboard</li>
          </ul>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Play className="h-4 w-4" />
          You can replay this tutorial anytime from Settings
        </div>
      </div>
    )
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {currentStepData.title}
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} of {onboardingSteps.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {currentStepData.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tutorial
              </Button>
              
              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-2"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}