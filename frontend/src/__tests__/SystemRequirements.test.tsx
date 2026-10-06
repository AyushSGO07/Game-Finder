import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SystemRequirements, { parseRequirementString } from '../components/game/SystemRequirements';

describe('SystemRequirements Component & HTML Sanitizer', () => {
  const sampleHtml = `
    <strong>Minimum:</strong><br>
    <ul class="bb_ul">
      <li><strong>OS:</strong> Windows 10</li>
      <li><strong>Processor:</strong> Intel Core i5-8400</li>
      <li><strong>Memory:</strong> 12 GB RAM</li>
      <li><strong>Graphics:</strong> NVIDIA GeForce GTX 1060</li>
    </ul>
  `;

  const sampleRecommendedHtml = `
    <strong>Recommended:</strong><br>
    <ul class="bb_ul">
      <li><strong>OS:</strong> Windows 11</li>
      <li><strong>Processor:</strong> Intel Core i7-8700K</li>
      <li><strong>Memory:</strong> 16 GB RAM</li>
      <li><strong>Graphics:</strong> NVIDIA GeForce GTX 1070</li>
    </ul>
  `;

  it('parseRequirementString cleans HTML tags and returns structured specs', () => {
    const specs = parseRequirementString(sampleHtml);
    expect(specs.length).toBe(4);

    expect(specs[0].key).toBe('OS');
    expect(specs[0].value).toBe('Windows 10');

    expect(specs[1].key).toBe('Processor');
    expect(specs[1].value).toBe('Intel Core i5-8400');
  });

  it('renders minimum requirements by default and switches to recommended tab', () => {
    render(
      <SystemRequirements
        pcRequirements={{
          minimum: sampleHtml,
          recommended: sampleRecommendedHtml,
        }}
      />
    );

    // Minimum specs visible initially
    expect(screen.getByText('Intel Core i5-8400')).toBeInTheDocument();
    expect(screen.queryByText('Intel Core i7-8700K')).not.toBeInTheDocument();

    // Click Recommended tab
    const recTab = screen.getByRole('button', { name: 'Recommended' });
    fireEvent.click(recTab);

    // Recommended specs visible now
    expect(screen.getByText('Intel Core i7-8700K')).toBeInTheDocument();
    expect(screen.queryByText('Intel Core i5-8400')).not.toBeInTheDocument();
  });

  it('renders clean fallback message when requirements are empty', () => {
    render(<SystemRequirements pcRequirements={undefined} />);
    expect(screen.getByText(/Detailed PC hardware specifications are not specified/i)).toBeInTheDocument();
  });
});
