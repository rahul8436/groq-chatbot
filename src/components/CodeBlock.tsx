'use client';

// components/CodeBlock.tsx
import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative'>
      <button
        onClick={copyToClipboard}
        className='absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-sm'
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {/* @ts-ignore */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
        PreTag='div'
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
