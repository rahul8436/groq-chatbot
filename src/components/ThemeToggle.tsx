'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className='w-full flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors'
      aria-label='Toggle theme'
    >
      {theme === 'light' ? (
        <FaMoon className='w-5 h-5' />
      ) : (
        <FaSun className='w-5 h-5' />
      )}
    </button>
  );
}
