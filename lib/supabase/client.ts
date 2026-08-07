import { createBrowserClient } from '@supabase/ssr';

// env is validated at startup — safe to use directly here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Browser Supabase client.
 * Use in Client Components and hooks.
 * This is a singleton — same instance is reused across renders.
 */
export const createBrowserSupabaseClient = () =>
  createBrowserClient(supabaseUrl, supabasePublishableKey);
