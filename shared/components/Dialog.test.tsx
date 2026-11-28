import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onClose={() => {}} title="New project">
        <p>Body</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an accessible dialog with title and description', () => {
    render(
      <Dialog open onClose={() => {}} title="New project" description="Start a study">
        <input aria-label="Name" />
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'New project' });
    expect(dialog).toHaveAccessibleDescription('Start a study');
  });

  it('closes on Escape and on the close button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="New project">
        <input aria-label="Name" />
      </Dialog>,
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('moves focus into the dialog when it opens', () => {
    render(
      <Dialog open onClose={() => {}} title="New project">
        <input aria-label="Name" />
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });
});
