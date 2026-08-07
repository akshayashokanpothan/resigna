import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCode } from '@/shared/errors/error-codes';
import type { Workspace } from '../types/workspace.types';
import type { CreateWorkspaceInput, WorkspaceRepository } from './workspace.repository';

function mapRow(row: Record<string, unknown>): Workspace {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    slug: row['slug'] as string,
    ownerId: row['owner_id'] as string,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError({
        code: ErrorCode.WORKSPACE_NOT_FOUND,
        message: error.message,
        cause: error,
      });
    }

    return (data ?? []).map(mapRow);
  }

  async findById(id: string): Promise<Workspace | null> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AppError({ code: ErrorCode.WORKSPACE_NOT_FOUND, message: error.message });
    }

    return data ? mapRow(data as Record<string, unknown>) : null;
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .insert({
        name: input.name,
        slug: input.slug,
        owner_id: input.ownerId,
      })
      .select()
      .single();

    if (error) {
      throw new AppError({
        code: ErrorCode.WORKSPACE_CREATION_FAILED,
        message: error.message,
        cause: error,
      });
    }

    return mapRow(data as Record<string, unknown>);
  }

  async slugExists(slug: string): Promise<boolean> {
    const { count } = await this.supabase
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);

    return (count ?? 0) > 0;
  }
}
