'use client';

import React from 'react';
import { Check, Sparkles, Sliders, Shield } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { id: 1, title: 'Genre & Vibe', icon: Sparkles, desc: 'What style of world?' },
  { id: 2, title: 'Difficulty & Age', icon: Sliders, desc: 'How hard and for who?' },
  { id: 3, title: 'Guidance Prompt', icon: Shield, desc: 'Personalize your dream game' },
];

export default function WizardStepper({
  currentStep,
  totalSteps = 3,
  onStepClick,
}: WizardStepperProps) {
  return (
    <div
      className="w-full mb-8 sm:mb-12"
      role="region"
      aria-label="Wizard Steps Progress"
    >
      <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-white/10 -z-0 rounded-full" />
        {/* Active progress fill */}
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 -z-0 rounded-full transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 82}%`,
          }}
        />

        {STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = Boolean(onStepClick && step.id <= currentStep);
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={`relative z-10 flex flex-col items-center group focus:outline-none transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Circle Badge */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 border shadow-lg ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                    : isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/40 ring-4 ring-indigo-500/30 scale-110'
                    : 'bg-slate-900 text-slate-400 border-white/10 group-hover:border-white/20'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <span
                  className={`block text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                      : isCompleted
                      ? 'text-emerald-300'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
                <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                  {step.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
