import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { createSupabaseClient } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

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
  supabaseClient: SupabaseClient; // Add supabaseClient to the context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, sessionToken } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState(createSupabaseClient());

  useEffect(() => {
    if (sessionToken) {
      setSupabaseClient(createSupabaseClient(sessionToken));
    } else {
      setSupabaseClient(createSupabaseClient()); // Unauthenticated client
    }
  }, [sessionToken]);

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
          
          // Optionally sync user data to Supabase only if sessionToken is present
          if (sessionToken) {
            await syncUserToSupabase(userData, supabaseClient);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, isLoaded, sessionToken, supabaseClient]); // Add sessionToken and supabaseClient to dependencies

  const syncUserToSupabase = async (userData: User, client: typeof createSupabaseClient) => {
    try {
      const { error } = await client
        .from('users')
        .upsert({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatarUrl,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        // Check if the error is due to missing table
        if (error.code === 'PGRST205') {
          console.warn('⚠️  Users table not found in Supabase. Skipping user sync. Please create the users table if you need user data persistence.');
        } else {
          console.error('❌ Error syncing user to Supabase:', error);
        }
      } else {
        console.log('✅ User synced to Supabase successfully');
      }
    } catch (error) {
      console.warn('⚠️  Could not sync user to Supabase:', error);
    }
  };

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const isSignedIn = !!user && isLoaded;

  return (
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, signOut, supabaseClient }}>
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
