import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Users, Target, CheckCircle, ShoppingCart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import AppLayout from "@/components/layout/app-layout";

export default function LeadMagnetCalculator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    businessName: "",
    monthlyInventoryValue: "",
    currentWastePercentage: "",
    industry: "",
  });

  const [results, setResults] = useState<{
    monthlySavings: number;
    annualSavings: number;
    wasteReduction: number;
    profitIncrease: number;
  } | null>(null);

  const submitCalculation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/lead-magnet/calculate", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Calculation Complete!",
        description: "Your potential savings have been calculated. Check your email for the detailed report.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate savings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const monthlyValue = parseFloat(formData.monthlyInventoryValue);
    const wastePercentage = parseFloat(formData.currentWastePercentage);
    
    if (!monthlyValue || !wastePercentage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to calculate your savings.",
        variant: "destructive",
      });
      return;
    }

    const calculatedData = {
      ...formData,
      monthlyInventoryValue: monthlyValue,
      currentWastePercentage: wastePercentage,
    };

    submitCalculation.mutate(calculatedData);
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 -m-6 p-6 min-h-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Inventory Waste Savings Calculator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how much money you could save by reducing inventory waste with AI-powered predictions
            </p>
          </div>

          {/* Main Calculator */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-600 dark:text-indigo-400">
                Calculate Your Potential Savings
              </CardTitle>
              <CardDescription>
                Enter your business information to see how much money you could save with better inventory management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="monthlyInventoryValue">Monthly Inventory Value ($) *</Label>
                  <Input
                    id="monthlyInventoryValue"
                    type="number"
                    placeholder="50000"
                    value={formData.monthlyInventoryValue}
                    onChange={(e) => handleInputChange("monthlyInventoryValue", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currentWastePercentage">Current Waste Percentage (%) *</Label>
                  <Input
                    id="currentWastePercentage"
                    type="number"
                    placeholder="15"
                    value={formData.currentWastePercentage}
                    onChange={(e) => handleInputChange("currentWastePercentage", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="grocery">Grocery Store</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="convenience">Convenience Store</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg"
                disabled={submitCalculation.isPending}
              >
                {submitCalculation.isPending ? "Calculating..." : "Calculate My Savings"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Your Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${results.monthlySavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Monthly Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${results.annualSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {results.wasteReduction}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Waste Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {results.profitIncrease}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Profit Increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <CardTitle>AI-Powered Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your inventory patterns and predicts what you'll need before you run out
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <CardTitle>Multi-Location Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage inventory across multiple locations with centralized control and reporting
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <CardTitle>Automated Reordering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up automatic purchase orders based on AI recommendations and demand forecasts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-indigo-600 text-white">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Join thousands of small businesses that have reduced their inventory waste by up to 30% with StockSense
              </p>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Get Starter Kit - $99
                </Button>
                <p className="text-indigo-100 text-sm">
                  Includes complete setup + 30-day trial, then $49-$99/month based on business size
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}