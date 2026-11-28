import { describe, expect, it } from 'vitest';
import { normalizeDescription, partitionProjectsByStatus } from './project.domain';
import type { Project } from '../types/project.types';

function project(id: string, status: Project['status']): Project {
  return {
    id,
    workspaceId: 'w1',
    name: `Project ${id}`,
    description: null,
    status,
    createdBy: null,
    createdAt: '2026-11-27T00:00:00Z',
    updatedAt: '2026-11-27T00:00:00Z',
  };
}

describe('partitionProjectsByStatus', () => {
  it('separates active and archived projects and keeps their order', () => {
    const result = partitionProjectsByStatus([
      project('a', 'active'),
      project('b', 'archived'),
      project('c', 'active'),
    ]);
    expect(result.active.map((p) => p.id)).toEqual(['a', 'c']);
    expect(result.archived.map((p) => p.id)).toEqual(['b']);
  });

  it('handles an empty list', () => {
    expect(partitionProjectsByStatus([])).toEqual({ active: [], archived: [] });
  });
});

describe('normalizeDescription', () => {
  it('trims text', () => {
    expect(normalizeDescription('  Interviews with nurses  ')).toBe('Interviews with nurses');
  });

  it('turns empty or missing values into null', () => {
    expect(normalizeDescription('   ')).toBeNull();
    expect(normalizeDescription('')).toBeNull();
    expect(normalizeDescription(undefined)).toBeNull();
  });
});
