import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, Tag } from './Badge';
import { Notification } from './Notification';
import { Logo, LogoSymbol } from './Logo';
import { IconButton } from './IconButton';
import { APP_DISPLAY_NAME } from '@/shared/constants/app.constants';
import { Search } from 'lucide-react';

describe('Notification', () => {
  it('uses role="alert" for errors and role="status" for info', () => {
    const { rerender } = render(<Notification tone="danger" title="Upload failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
    rerender(<Notification tone="info" title="Archived" />);
    expect(screen.getByRole('status')).toHaveTextContent('Archived');
  });

  it('has a labelled dismiss button', async () => {
    const onDismiss = vi.fn();
    render(<Notification tone="warning" title="Check this" onDismiss={onDismiss} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('Badge and Tag', () => {
  it('renders badge text', () => {
    render(<Badge tone="success">Validated</Badge>);
    expect(screen.getByText('Validated')).toBeInTheDocument();
  });

  it('filter tags are toggle buttons and removable tags have a named remove button', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    render(
      <>
        <Tag selected onToggle={onToggle}>
          Interviews
        </Tag>
        <Tag onRemove={onRemove}>Trust</Tag>
      </>,
    );
    const toggle = screen.getByRole('button', { name: 'Interviews' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Remove Trust' }));
    expect(onToggle).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('Logo and IconButton', () => {
  it('logo has an accessible name; decorative symbol is hidden', () => {
    render(
      <>
        <Logo />
        <LogoSymbol title="" />
      </>,
    );
    expect(screen.getAllByRole('img', { name: APP_DISPLAY_NAME })).toHaveLength(1);
  });

  it('icon buttons are named by their label', () => {
    render(<IconButton icon={Search} label="Search" />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});

describe('Beta marks (tests run as a non-production build)', () => {
  it('names the product "Resigna Beta" and shows a Beta badge next to the logo', () => {
    expect(APP_DISPLAY_NAME).toBe('Resigna Beta');
    render(<Logo />);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
