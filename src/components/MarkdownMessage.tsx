'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative group'>
      <button
        onClick={copyToClipboard}
        className='absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 bg-gray-800/50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        title='Copy code'
      >
        {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className='prose dark:prose-invert max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className='mb-4'>{children}</p>,
          ul: ({ children }) => (
            <ul className='list-disc pl-6 mb-4'>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal pl-6 mb-4'>{children}</ol>
          ),
          li: ({ children }) => <li className='mb-1'>{children}</li>,
          h1: ({ children }) => (
            <h1 className='text-2xl font-bold mb-4'>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-xl font-bold mb-3'>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-lg font-bold mb-2'>{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4'>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className='overflow-x-auto my-4'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className='px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200'>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
