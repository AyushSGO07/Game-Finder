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
  // Line connects center of step 1 (16.667%) to center of step 3 (83.333%)
  // Total span = 66.667%. Each segment between steps = 33.333%
  const progressRatio = Math.max(0, Math.min(1, (currentStep - 1) / (totalSteps - 1)));
  const progressWidth = `${progressRatio * 66.667}%`;

  return (
    <div
      className="w-full mb-8 sm:mb-12"
      role="region"
      aria-label="Wizard Steps Progress"
    >
      {/* Relative container holding progress lines and 3 distributed columns */}
      <div className="relative max-w-2xl mx-auto px-2 sm:px-4">
        {/* Background track line: passes through vertical center of the 48px icon container at y = 24px (top-6) */}
        <div
          aria-hidden="true"
          className="absolute top-6 left-[16.667%] right-[16.667%] -translate-y-1/2 h-1 bg-white/10 rounded-full z-0 pointer-events-none"
        />

        {/* Active progress line */}
        <div
          aria-hidden="true"
          className="absolute top-6 left-[16.667%] -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-full z-0 pointer-events-none transition-all duration-500 ease-out"
          style={{ width: progressWidth }}
        />

        {/* 3 Equally distributed step items in grid */}
        <div className="grid grid-cols-3 relative z-10">
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
                className={`flex flex-col items-center group focus:outline-none transition-all w-full select-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                {/* Fixed Dimension Icon Container (48px x 48px) so center never shifts */}
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                        : isActive
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/50 ring-4 ring-indigo-500/30 ring-offset-2 ring-offset-slate-950'
                        : 'bg-slate-900 text-slate-400 border-white/10 group-hover:border-white/20'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Step Labels and Supporting Descriptions consistently beneath */}
                <div className="mt-2.5 text-center px-1 max-w-full">
                  <span
                    className={`block text-xs sm:text-sm font-semibold tracking-tight transition-colors truncate sm:whitespace-normal ${
                      isActive
                        ? 'text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] font-bold'
                        : isCompleted
                        ? 'text-emerald-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {step.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
