import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import AuthPage from '../app/auth/page';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (param: string) => (param === 'redirect' ? '/library' : null),
  }),
}));

describe('AuthContext and AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders sign in tab by default', () => {
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Sign In/i })).toHaveLength(2);
  });

  it('switches to create account tab and shows username input', () => {
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const [createTab] = screen.getAllByRole('button', { name: /Create Account/i });
    fireEvent.click(createTab);

    expect(screen.getByRole('heading', { name: /Create Your Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pixelwarrior')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('switches to forgot password and validates empty email', async () => {
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const forgotBtn = screen.getByRole('button', { name: /Forgot\?/i });
    fireEvent.click(forgotBtn);

    expect(screen.getByRole('heading', { name: /Reset Your Password/i })).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const form = emailInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
  });

  it('validates password length on signup', async () => {
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const [createTab] = screen.getAllByRole('button', { name: /Create Account/i });
    fireEvent.click(createTab);

    const usernameInput = screen.getByPlaceholderText('pixelwarrior');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(usernameInput, { target: { value: 'coolgamer' } });
    fireEvent.change(emailInput, { target: { value: 'cool@gamer.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });

    const form = usernameInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
