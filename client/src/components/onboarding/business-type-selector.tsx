import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ChefHat, Package, Users, ArrowRight } from "lucide-react";

const businessTypes = [
  {
    id: "restaurant",
    name: "Restaurant & Food Service",
    description: "Cafés, restaurants, bars, catering services",
    icon: ChefHat,
    color: "text-orange-600",
    features: ["Perishable tracking", "Recipe costing", "Seasonal menu planning"],
    popular: true
  },
  {
    id: "retail",
    name: "Retail Store",
    description: "Boutiques, convenience stores, specialty shops",
    icon: Store,
    color: "text-blue-600",
    features: ["Product categorization", "Supplier management", "Demand forecasting"],
    popular: false
  },
  {
    id: "wholesale",
    name: "Wholesale Distribution",
    description: "Distribution centers, wholesale operations",
    icon: Package,
    color: "text-green-600",
    features: ["Bulk inventory", "Multi-location tracking", "B2B analytics"],
    popular: false
  },
  {
    id: "multi",
    name: "Multi-Location Business",
    description: "Franchise operations, chain stores",
    icon: Users,
    color: "text-purple-600",
    features: ["Centralized control", "Location analytics", "Consolidated reporting"],
    popular: false
  },
];

interface BusinessTypeSelectorProps {
  onSelect: (businessType: string) => void;
}

export default function BusinessTypeSelector({ onSelect }: BusinessTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>("");

  const handleSelect = (businessType: string) => {
    setSelectedType(businessType);
  };

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to StockSense!
          </h1>
          <p className="text-lg text-gray-600">
            Let's customize your experience based on your business type
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {businessTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`transition-all cursor-pointer hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => handleSelect(type.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`h-8 w-8 ${type.color} mr-3`} />
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </div>
                    {type.popular && (
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedType}
            className="px-8 py-4"
          >
            Continue Setup
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}