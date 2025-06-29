import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have placeholder values or missing environment variables
const hasPlaceholderValues = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('your-project-ref') || 
  supabaseAnonKey.includes('your-anon-key-here') ||
  supabaseUrl === 'https://demo.supabase.co' ||
  supabaseAnonKey === 'demo-anon-key';

let supabase: any;

if (hasPlaceholderValues) {
  console.warn('⚠️  Supabase not configured - using development mode');
  console.warn('To connect to Supabase:');
  console.warn('1. Click "Connect to Supabase" button in the top right, or');
  console.warn('2. Update .env file with your actual Supabase credentials');
  
  // Create a mock client that properly handles all auth methods
  supabase = {
    auth: {
      signInWithPassword: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured' } 
      }),
      signUp: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured' } 
      }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ 
        data: { user: null }, 
        error: { message: 'Supabase not configured' } 
      }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      })
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    })
  };
} else {
  // Validate URL format for real Supabase URLs
  if (!supabaseUrl.startsWith('https://') || supabaseUrl.length < 20) {
    console.error('Invalid Supabase URL format. Expected format: https://your-project-ref.supabase.co');
    throw new Error('Invalid Supabase URL. Please check your VITE_SUPABASE_URL in .env file.');
  }

  // Validate anon key format (basic check)
  if (supabaseAnonKey.length < 100) {
    console.error('Invalid Supabase anon key. Please check your VITE_SUPABASE_ANON_KEY in .env file.');
    throw new Error('Invalid Supabase anon key. Please check your VITE_SUPABASE_ANON_KEY in .env file.');
  }

  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  });

  // Test connection on initialization
  supabase.from('users').select('count', { count: 'exact', head: true }).then(
    ({ error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error.message);
        console.error('Please verify your Supabase configuration and database setup.');
      } else {
        console.log('✅ Supabase connection successful');
      }
    }
  ).catch((error) => {
    console.error('Supabase connection test error:', error);
  });
}

export { supabase };