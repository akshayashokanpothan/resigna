import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

function Harness() {
  const [value, setValue] = useState('a');
  return (
    <Tabs
      label="Sections"
      value={value}
      onValueChange={setValue}
      items={[
        { id: 'a', label: 'Sources' },
        { id: 'b', label: 'Evidence', disabled: true },
        { id: 'c', label: 'Insights' },
      ]}
    >
      {(id) => <p>Panel {id}</p>}
    </Tabs>
  );
}

describe('Tabs', () => {
  it('exposes tabs with one tab stop and a labelled panel', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sources' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Insights' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel', { name: 'Sources' })).toHaveTextContent('Panel a');
  });

  it('moves with arrow keys, skipping disabled tabs, and wraps with Home/End', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Sources' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Insights' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel c');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Sources' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Insights' })).toHaveAttribute('aria-selected', 'true');
  });
});
