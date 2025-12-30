import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client only if credentials are available
// This allows the app to work with local storage fallback when Supabase is not configured
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper to check if Supabase is available
export const isSupabaseConfigured = () => !!supabase;