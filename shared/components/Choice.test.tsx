import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, Radio, RadioGroup, Switch } from './Choice';

describe('Checkbox, Radio, Switch', () => {
  it('toggles a checkbox from its label and supports the mixed state', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="Include notes" description="Field notes and memos" />
        <Checkbox label="Select all" indeterminate />
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Include notes' });
    expect(box).toHaveAccessibleDescription('Field notes and memos');
    await user.click(screen.getByText('Include notes'));
    expect(box).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBePartiallyChecked();
  });

  it('groups radios under a legend', () => {
    render(
      <RadioGroup legend="Visibility">
        <Radio name="v" label="Workspace" defaultChecked />
        <Radio name="v" label="Only me" />
      </RadioGroup>,
    );
    expect(screen.getByRole('group', { name: 'Visibility' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Workspace' })).toBeChecked();
  });

  it('reports switch changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Suggest themes" checked={false} onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Suggest themes' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
