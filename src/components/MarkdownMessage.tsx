'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FaCopy, FaCheck, FaPaperclip, FaDownload } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { FileAttachment } from '@/lib/types';
import Image from 'next/image';
import CodeBlock from './CodeBlock';

interface MarkdownMessageProps {
  content: string;
  attachments?: FileAttachment[];
}

interface CodeBlockProps {
  language: string;
  value: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  attachments,
}) => {
  const handleDownload = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.content;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='prose dark:prose-invert max-w-none'>
      {attachments && attachments.length > 0 && (
        <div className='mb-4 flex flex-wrap gap-2'>
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className='flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm'
            >
              {attachment.type.startsWith('image/') ? (
                <div className='relative group'>
                  <Image
                    src={attachment.url || ''}
                    alt={attachment.name}
                    width={64}
                    height={64}
                    className='object-cover rounded cursor-pointer'
                    onClick={() => window.open(attachment.url || '', '_blank')}
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100'>
                    <button
                      onClick={() => handleDownload(attachment)}
                      className='p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg'
                      title='Download'
                    >
                      <FaDownload className='h-4 w-4 text-gray-700 dark:text-gray-300' />
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <FaPaperclip className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-700 dark:text-gray-300'>
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => handleDownload(attachment)}
                    className='p-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'
                    title='Download'
                  >
                    <FaDownload className='h-4 w-4' />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
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
