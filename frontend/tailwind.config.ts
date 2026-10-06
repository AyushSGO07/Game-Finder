import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#090a0f',
          surface: '#111420',
          card: '#161a29',
        },
        accent: {
          primary: '#6366f1', // Indigo-500
          hover: '#4f46e5',   // Indigo-600
          cyan: '#06b6d4',    // Cyan-500
          gold: '#f59e0b',    // Amber-500
          crimson: '#ef4444', // Red-500
          emerald: '#10b981', // Emerald-500
        },
        glass: {
          DEFAULT: 'rgba(18, 22, 34, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(99, 102, 241, 0.4)',
        },
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
