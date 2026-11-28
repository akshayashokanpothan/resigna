import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCode } from '@/shared/errors/error-codes';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.types';
import type { ProjectRepository } from './project.repository';

function mapRow(row: Record<string, unknown>): Project {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    name: row['name'] as string,
    description: (row['description'] as string | null) ?? null,
    status: (row['status'] as 'active' | 'archived') ?? 'active',
    createdBy: (row['created_by'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(workspaceId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new AppError({
        code: ErrorCode.PROJECT_NOT_FOUND,
        message: error.message,
        cause: error,
      });
    }

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  }

  async findById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase.from('projects').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AppError({ code: ErrorCode.PROJECT_NOT_FOUND, message: error.message });
    }

    return data ? mapRow(data as Record<string, unknown>) : null;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        workspace_id: input.workspaceId,
        name: input.name,
        description: input.description ?? null,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new AppError({
        code: ErrorCode.PROJECT_CREATION_FAILED,
        message: error.message,
        cause: error,
      });
    }

    return mapRow(data as Record<string, unknown>);
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError({
        code: ErrorCode.PROJECT_UPDATE_FAILED,
        message: error.message,
        cause: error,
      });
    }

    return mapRow(data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('projects').delete().eq('id', id);
    if (error) {
      throw new AppError({ code: ErrorCode.PROJECT_NOT_FOUND, message: error.message });
    }
  }
}
