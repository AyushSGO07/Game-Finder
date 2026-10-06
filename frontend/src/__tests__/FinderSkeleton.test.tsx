import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FinderSkeleton from '../components/finder/FinderSkeleton';

describe('FinderSkeleton Component', () => {
  it('renders exactly 8 placeholder skeleton cards and status ticker', () => {
    render(<FinderSkeleton />);

    // 8 card skeletons
    const skeletons = screen.getAllByTestId('finder-skeleton-card');
    expect(skeletons).toHaveLength(8);

    // Dynamic progress message indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
