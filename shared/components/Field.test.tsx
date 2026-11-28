import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';
import { Input, Select, Textarea } from './Input';

describe('Field', () => {
  it('labels the control and links helper text', () => {
    render(
      <Field label="Name" helperText="Shown to your team.">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAccessibleDescription('Shown to your team.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the control invalid and describes it with the error instead of the helper', () => {
    render(
      <Field label="Name" helperText="Shown to your team." error="Name is required.">
        <Textarea />
      </Field>,
    );
    const control = screen.getByLabelText('Name');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('Name is required.');
  });

  it('shows "(optional)" and passes required through', () => {
    const { rerender } = render(
      <Field label="Method" optional>
        <Select>
          <option>Interview</option>
        </Select>
      </Field>,
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();
    rerender(
      <Field label="Method" required>
        <Select>
          <option>Interview</option>
        </Select>
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Method' })).toBeRequired();
  });
});
