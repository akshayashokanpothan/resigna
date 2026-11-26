import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config/env';

/**
 * Browser Supabase client.
 * Use in Client Components and hooks.
 * `createBrowserClient` returns a shared singleton in the browser.
 */
export const createBrowserSupabaseClient = () =>
  createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
