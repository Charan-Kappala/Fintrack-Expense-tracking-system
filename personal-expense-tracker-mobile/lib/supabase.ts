import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Export a function to create a Supabase client with an optional access token
export const createSupabaseClient = (accessToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
    },
  });
};

// Export a default unauthenticated client for initial use (e.g., in AuthContext before session is established)
export const supabase = createSupabaseClient();