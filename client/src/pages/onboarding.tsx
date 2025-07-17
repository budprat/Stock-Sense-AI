import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import BusinessTypeSelector from "@/components/onboarding/business-type-selector";
import { CheckCircle, ArrowRight, Target, Users, Zap } from "lucide-react";

type OnboardingStep = "business-type" | "goals" | "complete";

const goalOptions = [
  {
    id: "reduce-waste",
    title: "Reduce Food Waste",
    description: "Minimize spoilage and expiration losses",
    icon: Target,
    color: "text-green-600"
  },
  {
    id: "optimize-costs",
    title: "Optimize Inventory Costs",
    description: "Better cash flow and reduced carrying costs",
    icon: Zap,
    color: "text-blue-600"
  },
  {
    id: "improve-efficiency",
    title: "Improve Operational Efficiency",
    description: "Automate ordering and inventory management",
    icon: Users,
    color: "text-purple-600"
  }
];

export default function Onboarding() {
  const { businessType, setBusinessType, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("business-type");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleBusinessTypeSelect = (type: string) => {
    setBusinessType(type);
    setCurrentStep("goals");
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = () => {
    setCurrentStep("complete");
    setTimeout(() => {
      completeOnboarding();
    }, 2000);
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "business-type": return 1;
      case "goals": return 2;
      case "complete": return 3;
      default: return 1;
    }
  };

  const getProgress = () => {
    return (getStepNumber() / 3) * 100;
  };

  if (currentStep === "business-type") {
    return <BusinessTypeSelector onSelect={handleBusinessTypeSelect} />;
  }

  if (currentStep === "goals") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Progress value={getProgress()} className="w-full h-2" />
              <p className="text-sm text-gray-600 mt-2">Step {getStepNumber()} of 3</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              What are your main goals?
            </h1>
            <p className="text-lg text-gray-600">
              Select all that apply to customize your StockSense experience
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            {goalOptions.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);
              
              return (
                <Card 
                  key={goal.id}
                  className={`transition-all cursor-pointer hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Icon className={`h-8 w-8 ${goal.color} mr-4`} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-gray-600">{goal.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleComplete}
              disabled={selectedGoals.length === 0}
              className="px-8 py-4"
            >
              Complete Setup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to StockSense!
            </h1>
            <p className="text-lg text-gray-600">
              Your {businessType === 'restaurant' ? 'restaurant' : 'business'} is now set up and ready to optimize inventory management with AI.
            </p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Add your first products</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Set up inventory tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Configure AI recommendations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}