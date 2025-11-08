import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  businessType?: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  updateBusinessType: (type: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch user from backend session
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api', 'auth', 'user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error('Failed to fetch user');
        return await res.json();
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateBusinessTypeMutation = useMutation({
    mutationFn: async (businessType: string) => {
      if (!user) throw new Error('No user');
      return apiRequest('PATCH', `/api/users/${user.id}`, { businessType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'auth', 'user'] });
    },
  });

  const login = () => {
    window.location.href = '/api/login';
  };

  const logout = () => {
    window.location.href = '/api/logout';
  };

  const updateBusinessType = async (type: string) => {
    await updateBusinessTypeMutation.mutateAsync(type);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateBusinessType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
