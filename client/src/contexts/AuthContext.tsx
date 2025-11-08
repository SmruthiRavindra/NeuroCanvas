import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  hasCompletedGuardianSetup: boolean;
  hasCompletedOnboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserStatus: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in on mount
  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      // User not logged in, that's okay
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    
    toast({
      title: "Welcome back!",
      description: `Logged in as ${username}`,
    });
  }

  async function register(username: string, password: string, email?: string, phone?: string) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, phone }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setUser(data.user);
    
    toast({
      title: "Account created!",
      description: "Welcome to NeuroCanvas",
    });
  }

  async function logout() {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      setUser(null);
      toast({
        title: "Logged out",
        description: "See you soon!",
      });
    }
  }

  function updateUserStatus(updates: Partial<User>) {
    if (user) {
      setUser({ ...user, ...updates });
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
