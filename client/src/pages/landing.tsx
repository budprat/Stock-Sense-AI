import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn } from "lucide-react";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Smartphone,
  BarChart3,
  Shield,
  Zap,
  Package,
  DollarSign,
  Users,
  ChevronRight
} from "lucide-react";

const stats = [
  { label: "Market Size", value: "$3.58B", growth: "Growing to $7.14B by 2033" },
  { label: "Inventory Waste", value: "20-30%", growth: "Reduced by businesses" },
  { label: "Monthly Savings", value: "$5,000", growth: "Average per restaurant" },
  { label: "AI Accuracy", value: "95%", growth: "Demand forecasting" },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description: "Advanced machine learning algorithms predict demand, optimize stock levels, and prevent waste with 95% accuracy.",
    color: "text-blue-600"
  },
  {
    icon: AlertTriangle,
    title: "Smart Alerts",
    description: "Get instant notifications about low stock, expiring items, and emergency reorders to never miss critical moments.",
    color: "text-orange-600"
  },
  {
    icon: TrendingUp,
    title: "Demand Forecasting",
    description: "Predict future demand patterns with confidence intervals, seasonal adjustments, and external factor integration.",
    color: "text-green-600"
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Monitor inventory levels, expiration dates, and supplier performance in real-time across all locations.",
    color: "text-purple-600"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive reports and dashboards that turn data into actionable insights for better decision-making.",
    color: "text-indigo-600"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with encryption, compliance certifications, and robust access controls.",
    color: "text-red-600"
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Reduce Costs by 10%",
    description: "Eliminate overstocking and understocking issues that drain your profits.",
    stat: "Average $5,000 monthly savings"
  },
  {
    icon: Package,
    title: "Cut Waste by 30%",
    description: "Smart rotation, expiration tracking, and demand prediction minimize spoilage.",
    stat: "20-30% waste reduction"
  },
  {
    icon: Zap,
    title: "Automate 87% of Tasks",
    description: "AI handles reordering, alerts, and optimization so you can focus on your business.",
    stat: "Save 80% of time"
  },
  {
    icon: TrendingUp,
    title: "Improve Cash Flow",
    description: "Optimize inventory levels to free up capital and improve working capital ratios.",
    stat: "15% cash flow improvement"
  },
];

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Restaurant Owner",
    business: "Café Luna",
    content: "StockSense reduced our food waste by 40% in just 3 months. The AI recommendations are spot-on!",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Store Manager",
    business: "Urban Grocers",
    content: "Finally, an inventory system that actually understands small business needs. Game-changer!",
    rating: 5
  },
  {
    name: "Sarah Thompson",
    role: "Bakery Owner",
    business: "Sweet Dreams Bakery",
    content: "The demand forecasting helped us plan for seasonal peaks. Revenue up 25% this quarter.",
    rating: 5
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for single-location businesses",
    features: [
      "Up to 1,000 products",
      "Basic AI recommendations",
      "Mobile app access",
      "Email support",
      "Standard reports"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "$189",
    period: "per month",
    description: "Ideal for growing businesses",
    features: [
      "Up to 5,000 products",
      "Advanced AI analytics",
      "Multi-location support",
      "POS integrations",
      "Priority support",
      "Custom reports"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$249",
    period: "per month",
    description: "For established multi-location operations",
    features: [
      "Unlimited products",
      "Full AI optimization suite",
      "Advanced integrations",
      "Dedicated account manager",
      "Custom training",
      "API access"
    ],
    popular: false
  },
];

export default function Landing() {
  const [selectedPlan, setSelectedPlan] = useState("Professional");

  const handleGetStarted = () => {
    // Navigate to Replit Auth login
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    // Navigate to Replit Auth login
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">StockSense</h1>
              <span className="ml-2 text-sm text-muted-foreground">AI-Powered Inventory</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-primary">Benefits</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary">Reviews</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleSignIn}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button onClick={handleGetStarted} size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Trusted by 1,000+ Small Businesses
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Wasting Money on
              <span className="block text-primary">Inventory Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              StockSense uses AI to tell you exactly <strong>what's about to run out</strong>, 
              <strong> what's not moving</strong>, and <strong>what to order now</strong>. 
              Reduce waste by 30% and save $5,000+ monthly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="px-8 py-4">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise AI for Small Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlike basic tracking tools or complex enterprise solutions, StockSense delivers 
              sophisticated AI capabilities through simple, accessible interfaces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center">
                      <Icon className={`h-8 w-8 ${feature.color} mr-3`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Proven Results for Small Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of restaurants and retailers who've transformed their operations with StockSense.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 mb-3">{benefit.description}</p>
                  <Badge variant="secondary" className="text-xs">{benefit.stat}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real results from real small business owners
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business size and needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`transition-shadow hover:shadow-lg ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful small businesses using StockSense to reduce waste, 
            optimize costs, and improve cash flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">StockSense</h3>
              <p className="text-gray-400">
                AI-powered inventory management for small businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StockSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}