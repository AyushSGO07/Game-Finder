import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '@/components/reviews/StarRating';

describe('StarRating Component', () => {
  it('renders 10 star buttons and reflects the provided rating value', () => {
    render(<StarRating value={8} />);

    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(10);
    expect(screen.getByText('Great (8/10)')).toBeInTheDocument();
  });

  it('updates hover label on mouse enter and resets on mouse leave', () => {
    render(<StarRating value={5} />);

    const tenthStar = screen.getByRole('radio', { name: '10 of 10 stars' });
    fireEvent.mouseEnter(tenthStar);
    expect(screen.getByText('Masterpiece (10/10)')).toBeInTheDocument();

    const group = screen.getByRole('radiogroup');
    fireEvent.mouseLeave(group);
    expect(screen.getByText('Decent (5/10)')).toBeInTheDocument();
  });

  it('calls onChange with the selected rating value on click', () => {
    const handleChange = vi.fn();
    render(<StarRating value={5} onChange={handleChange} />);

    const ninthStar = screen.getByRole('radio', { name: '9 of 10 stars' });
    fireEvent.click(ninthStar);

    expect(handleChange).toHaveBeenCalledWith(9);
  });

  it('supports keyboard arrow navigation', () => {
    const handleChange = vi.fn();
    render(<StarRating value={7} onChange={handleChange} />);

    const seventhStar = screen.getByRole('radio', { name: '7 of 10 stars' });
    fireEvent.keyDown(seventhStar, { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith(8);
  });

  it('disables interaction when readOnly is true', () => {
    const handleChange = vi.fn();
    render(<StarRating value={8} onChange={handleChange} readOnly />);

    const stars = screen.getAllByRole('radio');
    expect(stars[0]).toBeDisabled();

    fireEvent.click(stars[9]);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
