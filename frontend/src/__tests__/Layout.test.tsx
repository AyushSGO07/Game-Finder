import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RootLayout, { metadata } from '../app/layout';

describe('RootLayout Component', () => {
  it('defines correct SEO metadata', () => {
    expect(metadata.title).toBe('Game Finder — Discover Your Next Great Game');
    expect(metadata.description).toContain('AI-powered game recommendations');
  });

  it('renders children within the main content container', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Gaming Platform Ready</div>
      </RootLayout>
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Gaming Platform Ready');

    const mainElement = container.querySelector('#main-content');
    expect(mainElement).not.toBeNull();
    expect(mainElement).toContainElement(child);
  });
});
