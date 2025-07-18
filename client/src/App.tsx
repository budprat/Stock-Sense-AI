import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import Suppliers from "@/pages/suppliers";
import Settings from "@/pages/settings";
import Reports from "@/pages/reports";
import Locations from "@/pages/locations";
import Users from "@/pages/users";
import Achievements from "@/pages/achievements";
import NotFound from "@/pages/not-found";
import OnboardingTutorial from "@/components/onboarding/onboarding-tutorial";
import FeedbackWidget from "@/components/feedback/feedback-widget";
import AchievementNotification from "@/components/achievements/achievement-notification";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useState } from "react";
import type { Achievement } from "@shared/schema";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null);
  
  // Check if user is first time based on business type
  const isFirstTime = user && !user.businessType;

  return (
    <>
      <Switch>
        <Route path="/">
          {() => {
            if (isLoading) {
              return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
            }
            if (!isAuthenticated) {
              return <Landing />;
            }
            if (isFirstTime) {
              return <Onboarding />;
            }
            return <Dashboard />;
          }}
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/settings" component={Settings} />
        <Route path="/reports" component={Reports} />
        <Route path="/locations" component={Locations} />
        <Route path="/users" component={Users} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Onboarding Tutorial */}
      {showOnboarding && isAuthenticated && (
        <OnboardingTutorial 
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      
      {/* Feedback Widget */}
      {isAuthenticated && <FeedbackWidget />}
      
      {/* Achievement Notification */}
      <AchievementNotification 
        achievement={achievementNotification} 
        onClose={() => setAchievementNotification(null)} 
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
