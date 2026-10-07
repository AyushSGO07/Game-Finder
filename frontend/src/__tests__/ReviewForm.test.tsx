import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from '@/components/reviews/ReviewForm';

describe('ReviewForm Component', () => {
  it('renders rating selector, title input, and markdown editor', () => {
    render(<ReviewForm gameId="1245620" onSubmit={vi.fn()} />);

    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByLabelText(/Headline \/ Summary Title/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Write/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Review/i })).toBeInTheDocument();
  });

  it('switches between Write and Preview tabs', () => {
    render(<ReviewForm gameId="1245620" onSubmit={vi.fn()} />);

    const textarea = screen.getByLabelText(/Review content in markdown/i);
    fireEvent.change(textarea, { target: { value: '**Sensational** boss battles!' } });

    const previewTab = screen.getByRole('tab', { name: /Preview/i });
    fireEvent.click(previewTab);

    // Markdown rendered bold element
    expect(screen.getByText('Sensational')).toBeInTheDocument();
  });

  it('prevents submission and displays error when body is empty', async () => {
    const handleSubmit = vi.fn();
    render(<ReviewForm gameId="1245620" onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Post Review/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Review body cannot be empty/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid review with rating, title, and body', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm gameId="1245620" onSubmit={handleSubmit} />);

    const titleInput = screen.getByLabelText(/Headline \/ Summary Title/i);
    fireEvent.change(titleInput, { target: { value: 'Peak FromSoftware' } });

    const textarea = screen.getByLabelText(/Review content in markdown/i);
    fireEvent.change(textarea, { target: { value: 'Every moment in the Lands Between is astonishing.' } });

    const submitBtn = screen.getByRole('button', { name: /Post Review/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        rating: 10,
        title: 'Peak FromSoftware',
        body: 'Every moment in the Lands Between is astonishing.',
      });
    });

    expect(await screen.findByText(/Your review was successfully submitted!/i)).toBeInTheDocument();
  });
});
