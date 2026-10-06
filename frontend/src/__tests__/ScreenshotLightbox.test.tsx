import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ScreenshotLightbox from '../components/game/ScreenshotLightbox';
import { ScreenshotItem } from '@/types/game';

describe('ScreenshotLightbox Component', () => {
  const sampleScreenshots: ScreenshotItem[] = [
    { id: 1, path_thumbnail: 'thumb1.jpg', path_full: 'full1.jpg' },
    { id: 2, path_thumbnail: 'thumb2.jpg', path_full: 'full2.jpg' },
    { id: 3, path_thumbnail: 'thumb3.jpg', path_full: 'full3.jpg' },
  ];

  it('does not render when isOpen is false', () => {
    render(
      <ScreenshotLightbox
        isOpen={false}
        screenshots={sampleScreenshots}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog', { name: 'Screenshot lightbox' })).not.toBeInTheDocument();
  });

  it('renders modal, active image, and index counter when isOpen is true', () => {
    render(
      <ScreenshotLightbox
        isOpen={true}
        initialIndex={0}
        screenshots={sampleScreenshots}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Screenshot lightbox' })).toBeInTheDocument();
    expect(screen.getByText('Screenshot 1 of 3')).toBeInTheDocument();
    expect(screen.getByAltText('Screenshot preview 1')).toHaveAttribute('src', 'full1.jpg');
  });

  it('navigates next and previous on chevron click and keyboard arrow events', () => {
    render(
      <ScreenshotLightbox
        isOpen={true}
        initialIndex={0}
        screenshots={sampleScreenshots}
        onClose={vi.fn()}
      />
    );

    // Chevron click next
    const nextBtn = screen.getByLabelText('Next screenshot');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Screenshot 2 of 3')).toBeInTheDocument();

    // Keyboard ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Screenshot 3 of 3')).toBeInTheDocument();

    // Keyboard ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Screenshot 2 of 3')).toBeInTheDocument();
  });

  it('calls onClose when close button or Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <ScreenshotLightbox
        isOpen={true}
        screenshots={sampleScreenshots}
        onClose={handleClose}
      />
    );

    // Click close button
    const closeBtn = screen.getByLabelText('Close lightbox');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
