import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Ensure unit tests are hermetic and test offline fallback resilience
  // Tests needing custom API responses can override global.fetch explicitly
  global.fetch = vi.fn().mockRejectedValue(new Error('Backend offline (unit test mode)'));
});
