import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded) {
        if (clerkUser) {
          const userData: User = {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            avatarUrl: clerkUser.imageUrl || ''
          };
          setUser(userData);
          
          // Optionally sync user data to Supabase
          await syncUserToSupabase(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, isLoaded]);

  const syncUserToSupabase = async (userData: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatarUrl,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
    }
  };

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const isSignedIn = !!user && isLoaded;

  return (
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};