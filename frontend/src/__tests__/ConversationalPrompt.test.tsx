import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConversationalPrompt from '../components/finder/ConversationalPrompt';

describe('ConversationalPrompt Component', () => {
  it('renders prompt input, inspiration chips, and character counter', () => {
    const onChangePrompt = vi.fn();

    render(
      <ConversationalPrompt
        prompt=""
        onChangePrompt={onChangePrompt}
      />
    );

    expect(screen.getByPlaceholderText(/describe your dream game/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 300/i)).toBeInTheDocument();
    expect(screen.getByText(/Try an inspiration prompt/i)).toBeInTheDocument();
  });

  it('updates input on user typing', () => {
    const onChangePrompt = vi.fn();

    render(
      <ConversationalPrompt
        prompt=""
        onChangePrompt={onChangePrompt}
      />
    );

    const textarea = screen.getByPlaceholderText(/describe your dream game/i);
    fireEvent.change(textarea, { target: { value: 'Cyberpunk detective story' } });
    expect(onChangePrompt).toHaveBeenCalledWith('Cyberpunk detective story');
  });

  it('populates prompt when an inspiration chip is clicked', () => {
    const onChangePrompt = vi.fn();

    render(
      <ConversationalPrompt
        prompt=""
        onChangePrompt={onChangePrompt}
      />
    );

    const chip = screen.getByRole('button', { name: /Cyberpunk detective mystery/i });
    fireEvent.click(chip);
    expect(onChangePrompt).toHaveBeenCalledWith(
      expect.stringContaining('Cyberpunk detective mystery')
    );
  });

  it('clears prompt when clear button is clicked', () => {
    const onChangePrompt = vi.fn();

    render(
      <ConversationalPrompt
        prompt="Some long query"
        onChangePrompt={onChangePrompt}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Clear prompt/i });
    fireEvent.click(clearBtn);
    expect(onChangePrompt).toHaveBeenCalledWith('');
  });
});
