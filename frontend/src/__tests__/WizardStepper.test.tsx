import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WizardStepper from '../components/finder/WizardStepper';

describe('WizardStepper Component', () => {
  it('renders all three steps with accessible labels', () => {
    render(<WizardStepper currentStep={1} />);

    expect(screen.getByRole('region', { name: 'Wizard Steps Progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Step 1: Genre & Vibe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Step 2: Difficulty & Age/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Step 3: Guidance Prompt/i })).toBeInTheDocument();
  });

  it('marks active step with aria-current="step"', () => {
    const { rerender } = render(<WizardStepper currentStep={2} />);

    const step1 = screen.getByRole('button', { name: /Step 1: Genre & Vibe/i });
    const step2 = screen.getByRole('button', { name: /Step 2: Difficulty & Age/i });
    const step3 = screen.getByRole('button', { name: /Step 3: Guidance Prompt/i });

    expect(step1).not.toHaveAttribute('aria-current');
    expect(step2).toHaveAttribute('aria-current', 'step');
    expect(step3).not.toHaveAttribute('aria-current');

    // Rerender at Step 3
    rerender(<WizardStepper currentStep={3} />);
    expect(screen.getByRole('button', { name: /Step 3: Guidance Prompt/i })).toHaveAttribute('aria-current', 'step');
  });

  it('triggers onStepClick when clicking visited or active steps, disables upcoming steps', () => {
    const onStepClick = vi.fn();
    render(<WizardStepper currentStep={2} onStepClick={onStepClick} />);

    const step1 = screen.getByRole('button', { name: /Step 1: Genre & Vibe/i });
    const step2 = screen.getByRole('button', { name: /Step 2: Difficulty & Age/i });
    const step3 = screen.getByRole('button', { name: /Step 3: Guidance Prompt/i });

    expect(step1).toBeEnabled();
    expect(step2).toBeEnabled();
    expect(step3).toBeDisabled();

    fireEvent.click(step1);
    expect(onStepClick).toHaveBeenCalledWith(1);

    fireEvent.click(step3);
    // Upcoming step should not fire callback
    expect(onStepClick).toHaveBeenCalledTimes(1);
  });

  it('renders supporting step descriptions consistently beneath each icon', () => {
    render(<WizardStepper currentStep={1} />);

    expect(screen.getByText('What style of world?')).toBeInTheDocument();
    expect(screen.getByText('How hard and for who?')).toBeInTheDocument();
    expect(screen.getByText('Personalize your dream game')).toBeInTheDocument();
  });
});
