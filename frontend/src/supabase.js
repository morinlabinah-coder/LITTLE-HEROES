import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vercel does not read the local .env file. Avoid a blank screen when its
// environment variables have not yet been configured for a deployment.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
export const configurationError = supabase ? '' : 'Login is unavailable until the Vercel Supabase environment variables are configured.';
export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
