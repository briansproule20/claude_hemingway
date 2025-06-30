import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock Echo types
interface MockEchoUser {
  name?: string;
  id?: string;
}

interface MockEchoContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: MockEchoUser | null;
  balance: number | null;
  signOut: () => void;
  signIn: () => void;
}

// Create mock Echo context
const MockEchoContext = createContext<MockEchoContextValue | null>(null);

interface MockEchoProviderProps {
  children: ReactNode;
  config: {
    appId: string;
  };
}

export const MockEchoProvider: React.FC<MockEchoProviderProps> = ({ children, config }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<MockEchoUser | null>(null);
  const [balance, setBalance] = useState<number | null>(100); // Demo balance

  const signIn = () => {
    console.log('Mock Echo: Starting authentication...');
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setIsAuthenticated(true);
      setUser({ name: 'Demo User', id: 'demo-123' });
      setBalance(100);
      setIsLoading(false);
      console.log('Mock Echo: Authentication successful!');
    }, 1000);
  };

  const signOut = () => {
    console.log('Mock Echo: Signing out...');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(null);
  };

  const contextValue: MockEchoContextValue = {
    isAuthenticated,
    isLoading,
    user,
    balance,
    signOut,
    signIn,
  };

  return (
    <MockEchoContext.Provider value={contextValue}>
      {children}
    </MockEchoContext.Provider>
  );
};

// Mock useEcho hook
export const useMockEcho = (): MockEchoContextValue => {
  const context = useContext(MockEchoContext);
  if (!context) {
    throw new Error('useMockEcho must be used within a MockEchoProvider');
  }
  return context;
}; 