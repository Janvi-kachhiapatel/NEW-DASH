"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { dataStorage, User } from '@/lib/dataStorage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'business_owner';
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, role: 'customer' | 'business_owner') => Promise<AuthUser>;
  signUp: (name: string, email: string, phone: string, password: string, role: 'customer' | 'business_owner') => Promise<AuthUser>;
  signOut: () => void;
}

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, role: 'customer' | 'business_owner'): Promise<AuthUser> => {
    // Get stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('storedUsers') || '[]') as StoredUser[];
    
    // Find user with matching email and role
    const foundUser = storedUsers.find(u => u.email === email && u.role === role);
    
    if (!foundUser) {
      throw new Error('User not found');
    }
    
    // Check password (in a real app, this would use proper password hashing)
    if (foundUser.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Create auth user object (without password)
    const authUser: AuthUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role === 'admin' ? 'business_owner' : foundUser.role,
      isVerified: true,
      createdAt: foundUser.created_at
    };

    localStorage.setItem('currentUser', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  };

  const signUp = async (name: string, email: string, phone: string, password: string, role: 'customer' | 'business_owner'): Promise<AuthUser> => {
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('storedUsers') || '[]') as StoredUser[];
    
    // Check if user already exists
    if (storedUsers.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    // Create new user with password
    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role,
      businesses: [],
      password, // In a real app, this would be hashed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store user with password
    storedUsers.push(newUser);
    localStorage.setItem('storedUsers', JSON.stringify(storedUsers));
    
    // Also store in dataStorage for compatibility
    dataStorage.addUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      businesses: newUser.businesses,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    });
    
    // Create auth user object (without password)
    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role === 'admin' ? 'business_owner' : newUser.role,
      isVerified: true,
      createdAt: newUser.created_at
    };

    localStorage.setItem('currentUser', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  };

  const signOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
