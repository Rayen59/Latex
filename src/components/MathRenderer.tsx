import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Tokenize text into math blocks ($$...$$, $...$, \[...\], \(...\)) and plain text
    // Regex matches:
    // 1. $$...$$ (display math)
    // 2. \[...\] (display math)
    // 3. $...$ (inline math, avoiding escaped \$)
    // 4. \(...\) (inline math)
    const regex = /(\$\$(?:[\s\S]*?)\$\$|\\\[(?:[\s\S]*?)\\\]|\$(?:[^\$\n]+?)\$|\\\((?:[\s\S]*?)\\\))/g;
    
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      const isDisplayMath = (part.startsWith('$$') && part.endsWith('$$')) ||
                            (part.startsWith('\\[') && part.endsWith('\\]'));
      const isInlineMath = (part.startsWith('$') && part.endsWith('$')) ||
                           (part.startsWith('\\(') && part.endsWith('\\)'));

      if (isDisplayMath) {
        const mathExpr = part.startsWith('$$')
          ? part.slice(2, -2)
          : part.slice(2, -2);
        try {
          const html = katex.renderToString(mathExpr.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto p-3.5 bg-slate-950/75 rounded-xl border border-indigo-500/20 shadow-inner text-indigo-100 flex flex-col items-center justify-center group relative"
            >
              <div className="w-full overflow-x-auto text-center py-1 font-serif text-[1.05rem]" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          );
        } catch {
          return (
            <pre key={index} className="my-2 p-2.5 bg-rose-950/50 text-rose-300 rounded-lg text-xs font-mono overflow-x-auto border border-rose-800/40">
              {part}
            </pre>
          );
        }
      }

      if (isInlineMath) {
        const mathExpr = part.startsWith('$')
          ? part.slice(1, -1)
          : part.slice(2, -2);
        try {
          const html = katex.renderToString(mathExpr.trim(), {
            displayMode: false,
            throwOnError: false,
            trust: true,
          });
          return (
            <span
              key={index}
              className="inline-math inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 font-medium shadow-2xs"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={index} className="bg-rose-900/40 text-rose-300 px-1 py-0.5 rounded font-mono text-xs border border-rose-800/40">
              {part}
            </span>
          );
        }
      }

      // Plain text: preserve line breaks
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [content]);

  return <div className={`math-content leading-relaxed ${className}`}>{renderedElements}</div>;
};
