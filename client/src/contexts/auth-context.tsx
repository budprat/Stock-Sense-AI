import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  businessType: string | null;
  setBusinessType: (type: string) => void;
  completeOnboarding: () => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [businessType, setBusinessType] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    const savedAuth = localStorage.getItem('stocksense_auth');
    const savedBusinessType = localStorage.getItem('stocksense_business_type');
    const savedOnboarding = localStorage.getItem('stocksense_onboarding_complete');
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      setIsFirstTime(savedOnboarding !== 'true');
      setBusinessType(savedBusinessType);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('stocksense_auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsFirstTime(true);
    setBusinessType(null);
    localStorage.removeItem('stocksense_auth');
    localStorage.removeItem('stocksense_business_type');
    localStorage.removeItem('stocksense_onboarding_complete');
  };

  const handleSetBusinessType = (type: string) => {
    setBusinessType(type);
    localStorage.setItem('stocksense_business_type', type);
  };

  const completeOnboarding = () => {
    setIsFirstTime(false);
    localStorage.setItem('stocksense_onboarding_complete', 'true');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isFirstTime,
      businessType,
      setBusinessType: handleSetBusinessType,
      completeOnboarding,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}