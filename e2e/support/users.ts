import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

/**
 * Test users are created with the local Supabase stack's admin API, so tests never
 * touch the live project. `npm run db:start` (or CI) provides these values.
 */
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      'E2E tests need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from the local Supabase stack (see e2e/README.md).',
    );
  }
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) {
    throw new Error(`Refusing to create test users on a non-local Supabase project: ${url}`);
  }
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function newTestUser(prefix = 'e2e'): TestUser {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test Researcher ${id}`,
    email: `${prefix}-${id}@example.com`,
    password: `Pw-${randomUUID()}`,
  };
}

/** Creates a confirmed user; the database trigger gives them a workspace. */
export async function createConfirmedUser(prefix?: string): Promise<TestUser> {
  const user = newTestUser(prefix);
  const { error } = await adminClient().auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name },
  });
  if (error) throw error;
  return user;
}
