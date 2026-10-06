'use client';

import React, { useState } from 'react';
import { Cpu, HardDrive, Monitor, Layers, Disc, Volume2 } from 'lucide-react';

interface SystemRequirementsProps {
  pcRequirements?: Record<string, string>;
}

interface SpecItem {
  key: string;
  value: string;
}

export function parseRequirementString(rawHtmlOrText?: string): SpecItem[] {
  if (!rawHtmlOrText) return [];

  // Strip HTML tags safely, replacing tags with spaces or newlines
  const plain = rawHtmlOrText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const lines = plain
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('minimum:') && !l.toLowerCase().startsWith('recommended:'));

  const specs: SpecItem[] = [];

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).replace(/\*/g, '').trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        specs.push({ key, value });
      }
    } else if (line.length > 5) {
      specs.push({ key: 'Notes', value: line });
    }
  }

  return specs;
}

export default function SystemRequirements({ pcRequirements }: SystemRequirementsProps) {
  const [activeTab, setActiveTab] = useState<'minimum' | 'recommended'>('minimum');

  const minRaw = pcRequirements?.minimum;
  const recRaw = pcRequirements?.recommended;

  const minSpecs = parseRequirementString(minRaw);
  const recSpecs = parseRequirementString(recRaw);

  const hasAnySpecs = minSpecs.length > 0 || recSpecs.length > 0;

  const renderSpecIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('os') || k.includes('system')) return <Monitor className="w-4 h-4 text-cyan-400" />;
    if (k.includes('processor') || k.includes('cpu')) return <Cpu className="w-4 h-4 text-indigo-400" />;
    if (k.includes('memory') || k.includes('ram')) return <Layers className="w-4 h-4 text-amber-400" />;
    if (k.includes('graphic') || k.includes('video') || k.includes('gpu')) return <Disc className="w-4 h-4 text-rose-400" />;
    if (k.includes('storage') || k.includes('hard drive') || k.includes('disk')) return <HardDrive className="w-4 h-4 text-emerald-400" />;
    if (k.includes('sound')) return <Volume2 className="w-4 h-4 text-purple-400" />;
    return <Monitor className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div
      aria-label="PC System Requirements"
      className="w-full rounded-2xl bg-slate-900/60 border border-white/5 p-6 backdrop-blur-md space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System Requirements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware specifications required to run this game on PC
          </p>
        </div>

        {/* Tab Controls */}
        {hasAnySpecs && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('minimum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'minimum'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Minimum
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recommended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'recommended'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recommended
            </button>
          </div>
        )}
      </div>

      {/* Specifications Grid */}
      {!hasAnySpecs ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          Detailed PC hardware specifications are not specified for this title.
        </div>
      ) : (
        <div>
          {activeTab === 'minimum' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {minSpecs.length > 0 ? (
                minSpecs.map((spec, i) => (
                  <div
                    key={`${spec.key}-${i}`}
                    className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 mt-0.5">
                      {renderSpecIcon(spec.key)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        {spec.key}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug break-words">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 col-span-2">
                  Minimum specifications not provided.
                </p>
              )}
            </div>
          )}

          {activeTab === 'recommended' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recSpecs.length > 0 ? (
                recSpecs.map((spec, i) => (
                  <div
                    key={`${spec.key}-${i}`}
                    className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 mt-0.5">
                      {renderSpecIcon(spec.key)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                        {spec.key}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug break-words">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 col-span-2">
                  Recommended specifications not provided.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
