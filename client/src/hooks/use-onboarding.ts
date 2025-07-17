import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('stocksense-onboarding-completed');
    const hasCompleted = completed === 'true';
    setHasCompletedOnboarding(hasCompleted);
    
    // Show onboarding if not completed
    if (!hasCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('stocksense-onboarding-completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('stocksense-onboarding-completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('stocksense-onboarding-completed');
    setHasCompletedOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding
  };
}