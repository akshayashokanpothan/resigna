import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseResearchRepository } from '../repositories/supabase-research.repository';
import type { ResearchRepository } from '../repositories/research.repository';

let _repo: ResearchRepository | null = null;

/** The research repository for the browser (RLS scopes every call to the signed-in user). */
export function researchService(): ResearchRepository {
  if (!_repo) _repo = new SupabaseResearchRepository(createBrowserSupabaseClient());
  return _repo;
}
