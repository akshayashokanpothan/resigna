export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  workspaceId: string;
  name: string;
  description?: string;
  createdBy: string;
}
