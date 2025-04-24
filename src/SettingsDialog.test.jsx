import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SettingsDialog from './SettingsDialog';

describe('SettingsDialog', () => {
  it('renders mute checkboxes', () => {
    const { getByLabelText } = render(<SettingsDialog savedSettings={{}} onSave={() => {}} open={true} />);
    expect(getByLabelText(/mute playlist/i)).toBeInTheDocument();
    expect(getByLabelText(/mute overlay/i)).toBeInTheDocument();
  });

  it('calls onSave when save is clicked', () => {
    const onSave = jest.fn();
    const { getAllByRole } = render(<SettingsDialog savedSettings={{}} onSave={onSave} open={true} />);
    const buttons = getAllByRole('button');
    // Debug: log button textContent
    buttons.forEach(btn => console.log('Button:', btn.textContent));
    const startBtn = buttons.find(btn => /start/i.test(btn.textContent));
    expect(startBtn).toBeDefined();
    startBtn && fireEvent.click(startBtn);
    expect(onSave).toHaveBeenCalled();
  });
});
