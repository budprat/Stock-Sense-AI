import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
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
import NotFound from "@/pages/not-found";
import OnboardingTutorial from "@/components/onboarding/onboarding-tutorial";
import FeedbackWidget from "@/components/feedback/feedback-widget";
import { useOnboarding } from "@/hooks/use-onboarding";

function Router() {
  const { isAuthenticated, isFirstTime } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <>
      <Switch>
        <Route path="/">
          {() => {
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
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
