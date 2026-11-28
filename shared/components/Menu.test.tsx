import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from './Menu';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function setup() {
  const onArchive = vi.fn();
  render(
    <Menu
      label="Project actions"
      items={[
        { id: 'edit', label: 'Edit', href: '/edit' },
        { id: 'share', label: 'Share', disabled: true },
        { id: 'archive', label: 'Archive', onSelect: onArchive },
      ]}
      trigger={(props) => (
        <button {...props} type="button">
          Actions
        </button>
      )}
    />,
  );
  return { onArchive, user: userEvent.setup() };
}

describe('Menu', () => {
  it('opens from the keyboard and focuses the first item', async () => {
    const { user } = setup();
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu', { name: 'Project actions' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('skips disabled items, selects with Enter, and returns focus', async () => {
    const { user, onArchive } = setup();
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus();
  });
});
