import React from 'react';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown tokens: `code`, **bold**, *italic*, and plain text safely.
 */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex to split by inline code (`...`), bold (**...**), or italic (*...*)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-white/5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc list-inside space-y-1 my-2 text-slate-300">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    // Flush any pending list
    flushList(index);

    if (!trimmed) {
      // Empty line / paragraph break
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-base font-bold text-white mt-3 mb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-white mt-4 mb-1.5 border-b border-white/5 pb-1">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={index} className="text-xl font-extrabold text-white mt-4 mb-2">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={index}
          className="border-l-2 border-indigo-500 pl-3 py-1 my-2 text-indigo-200/90 italic bg-indigo-950/20 rounded-r-lg"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else {
      elements.push(
        <p key={index} className="my-1.5 leading-relaxed text-slate-300">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return (
    <div className={`prose-sm max-w-none text-slate-300 space-y-1 leading-relaxed ${className}`}>
      {elements}
    </div>
  );
}
