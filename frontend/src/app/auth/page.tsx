'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gamepad2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/library';
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  const initialToken = searchParams.get('token') || '';

  const {
    user,
    isAuthenticated,
    login,
    signup,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(initialToken);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, redirectPath, router]);

  // Set token if provided in query param
  useEffect(() => {
    if (initialToken) {
      setResetToken(initialToken);
      setMode('reset');
    }
  }, [initialToken]);

  const switchMode = (newMode: AuthMode) => {
    clearError();
    setValidationError(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setValidationError('Please enter both email and password.');
        return;
      }
      try {
        await login(email.trim(), password);
        router.push(redirectPath);
      } catch {
        // error message set in AuthContext
      }
    } else if (mode === 'signup') {
      if (!email.trim() || !username.trim() || !password) {
        setValidationError('All fields are required.');
        return;
      }
      if (username.trim().length < 3) {
        setValidationError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
      try {
        await signup(email.trim(), password, username.trim());
        router.push(redirectPath);
      } catch {
        // error message set in AuthContext
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setValidationError('Please enter your email address.');
        return;
      }
      try {
        const res = await forgotPassword(email.trim());
        setSuccessMessage(
          res?.message || 'Password reset link sent. Please check your inbox or use the reset token.'
        );
      } catch {
        // error message set in AuthContext
      }
    } else if (mode === 'reset') {
      if (!email.trim() || !password) {
        setValidationError('Email and new password are required.');
        return;
      }
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
      try {
        const res = await resetPassword(email.trim(), password, resetToken.trim() || undefined);
        setSuccessMessage(res?.message || 'Password reset successfully! You can now log in.');
        setTimeout(() => {
          switchMode('login');
        }, 2000);
      } catch {
        // error message set in AuthContext
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Glow ambient background effects */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <Link
              href="/"
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-2 group"
            >
              <Gamepad2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {mode === 'login' && 'Sign in to access your game library, ratings & sync.'}
              {mode === 'signup' && 'Join Game Finder to track backlogs and get AI recommendations.'}
              {mode === 'forgot' && "Enter your account email and we'll send a recovery link."}
              {mode === 'reset' && 'Enter your security token and choose a new password.'}
            </p>
          </div>

          {/* Mode Switcher Tabs for Login/Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {(error || validationError) && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (only on signup) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="pixelwarrior"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email (login, signup, forgot, reset) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Token (only on reset) */}
            {mode === 'reset' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Reset Token</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            )}

            {/* Password (login, signup, reset) */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (signup, reset) */}
            {(mode === 'signup' || mode === 'reset') && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    {mode === 'reset' && 'Update Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom helper navigation links */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create one now
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium block mx-auto"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-slate-400 hover:text-slate-300 text-xs block mx-auto"
                >
                  Already have a reset token? Enter it here
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
