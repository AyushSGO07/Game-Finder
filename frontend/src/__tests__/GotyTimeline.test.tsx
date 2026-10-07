import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GotyTimeline from '@/components/goty/GotyTimeline';

describe('GotyTimeline Component', () => {
  const years = [2020, 2021, 2022, 2023, 2024];

  it('renders all year buttons with accessible tab roles', () => {
    const onSelectYear = vi.fn();
    render(
      <GotyTimeline
        years={years}
        selectedYear={2024}
        onSelectYear={onSelectYear}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);

    // Selected year has aria-selected="true"
    const activeTab = screen.getByRole('tab', { name: /2024/i });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');

    // Inactive year has aria-selected="false"
    const inactiveTab = screen.getByRole('tab', { name: /2022/i });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('triggers onSelectYear when a year button is clicked', () => {
    const onSelectYear = vi.fn();
    render(
      <GotyTimeline
        years={years}
        selectedYear={2024}
        onSelectYear={onSelectYear}
      />
    );

    const tab2022 = screen.getByRole('tab', { name: /2022/i });
    fireEvent.click(tab2022);

    expect(onSelectYear).toHaveBeenCalledWith(2022);
  });

  it('supports keyboard arrow navigation across tabs', () => {
    const onSelectYear = vi.fn();
    render(
      <GotyTimeline
        years={years}
        selectedYear={2022}
        onSelectYear={onSelectYear}
      />
    );

    const tab2022 = screen.getByRole('tab', { name: /2022/i });

    // ArrowRight should navigate to 2023 (index 3)
    fireEvent.keyDown(tab2022, { key: 'ArrowRight' });
    expect(onSelectYear).toHaveBeenCalledWith(2023);

    // ArrowLeft should navigate to 2021 (index 1)
    fireEvent.keyDown(tab2022, { key: 'ArrowLeft' });
    expect(onSelectYear).toHaveBeenCalledWith(2021);

    // Home should navigate to 2020 (first year)
    fireEvent.keyDown(tab2022, { key: 'Home' });
    expect(onSelectYear).toHaveBeenCalledWith(2020);

    // End should navigate to 2024 (last year)
    fireEvent.keyDown(tab2022, { key: 'End' });
    expect(onSelectYear).toHaveBeenCalledWith(2024);
  });
});
