import { describe, expect, it } from 'vitest';
import { deriveWorkspaceName, generateWorkspaceSlug } from './workspace.domain';

describe('deriveWorkspaceName', () => {
  it('uses a display name as-is', () => {
    expect(deriveWorkspaceName('Sarah Connor')).toBe("Sarah Connor's Workspace");
  });

  it('humanizes the local part of an email', () => {
    expect(deriveWorkspaceName('john.doe@acme.com')).toBe("John Doe's Workspace");
    expect(deriveWorkspaceName('jane_smith-lee@acme.com')).toBe("Jane Smith Lee's Workspace");
  });
});

describe('generateWorkspaceSlug', () => {
  it('lowercases before stripping, so capital letters are kept', () => {
    expect(generateWorkspaceSlug("Akshay's Workspace")).toBe('akshay-s-workspace');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateWorkspaceSlug('  Hello World!  ')).toBe('hello-world');
  });
});
