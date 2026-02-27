import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

 interface RegisterData {
   name: string;
   email: string;
   password: string;
   role: 'student' | 'teacher';
   code: string;
   phone: string;
   major?: string;
   department?: string;
 }
 
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
   register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo (mutable for registration)
let MOCK_USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@school.com', password: '1234', role: 'admin', name: 'ผู้ดูแลระบบ' },
  { id: '2', email: 'teacher@school.com', password: '1234', role: 'teacher', name: 'อ.สมชาย ใจดี' },
  { id: '3', email: 'student@school.com', password: '1234', role: 'student', name: 'นายสมศักดิ์ เรียนดี' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

   const register = async (data: RegisterData): Promise<boolean> => {
     // Simulate API call
     await new Promise(resolve => setTimeout(resolve, 500));
     
     // Check if email already exists
     const existingUser = MOCK_USERS.find(u => u.email === data.email);
     if (existingUser) {
       return false;
     }
 
     // Create new user
     const newUser: User & { password: string } = {
       id: String(MOCK_USERS.length + 1),
       email: data.email,
       password: data.password,
       role: data.role,
       name: data.name,
     };
 
     MOCK_USERS.push(newUser);
 
     // Auto login after registration
     const { password: _, ...userWithoutPassword } = newUser;
     setUser(userWithoutPassword);
     localStorage.setItem('user', JSON.stringify(userWithoutPassword));
     
     return true;
   };
 
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
       register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
