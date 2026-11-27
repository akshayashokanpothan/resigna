import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from './ProjectForm';

function setup() {
  const onSubmit = vi.fn().mockResolvedValue(true);
  const onCancel = vi.fn();
  render(
    <ProjectForm
      submitLabel="Create project"
      pendingLabel="Creating…"
      isPending={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
  return { onSubmit, onCancel, user: userEvent.setup() };
}

describe('ProjectForm', () => {
  it('shows a validation error for a name that is too short', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Name'), ' a ');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(await screen.findByText(/at least 2 characters/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Name'), '  Checkout interviews  ');
    await user.type(screen.getByLabelText(/Description/), 'Nurses on night shift');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Checkout interviews',
      description: 'Nurses on night shift',
    });
  });

  it('calls onCancel', async () => {
    const { onCancel, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
