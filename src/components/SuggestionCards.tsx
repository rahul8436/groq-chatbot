'use client';

import React, { useState, useEffect } from 'react';
import {
  FaCode,
  FaRobot,
  FaLightbulb,
  FaBook,
  FaTools,
  FaQuestion,
  FaRocket,
  FaBrain,
} from 'react-icons/fa';

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: 'coding' | 'learning' | 'productivity' | 'general';
}

interface SuggestionCardsProps {
  onSuggestionClick: (prompt: string) => void;
}

const SuggestionCards: React.FC<SuggestionCardsProps> = ({
  onSuggestionClick,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const allSuggestions: Suggestion[] = [
    {
      icon: <FaCode className='w-6 h-6' />,
      title: 'Debug my code',
      prompt: 'Help me debug this code and suggest improvements',
      category: 'coding',
    },
    {
      icon: <FaRobot className='w-6 h-6' />,
      title: 'Explain AI concepts',
      prompt: 'Explain the key concepts of machine learning in simple terms',
      category: 'learning',
    },
    {
      icon: <FaLightbulb className='w-6 h-6' />,
      title: 'Brainstorm ideas',
      prompt: 'Help me brainstorm creative ideas for my project',
      category: 'productivity',
    },
    {
      icon: <FaBook className='w-6 h-6' />,
      title: 'Learn a new language',
      prompt: 'Create a study plan for learning a new programming language',
      category: 'learning',
    },
    {
      icon: <FaTools className='w-6 h-6' />,
      title: 'Code optimization',
      prompt: 'How can I optimize this code for better performance?',
      category: 'coding',
    },
    {
      icon: <FaQuestion className='w-6 h-6' />,
      title: 'Solve a problem',
      prompt: 'Help me solve this technical problem step by step',
      category: 'general',
    },
    {
      icon: <FaRocket className='w-6 h-6' />,
      title: 'Project planning',
      prompt: 'Help me plan the architecture for my new project',
      category: 'productivity',
    },
    {
      icon: <FaBrain className='w-6 h-6' />,
      title: 'Algorithm help',
      prompt: 'Explain this algorithm and suggest improvements',
      category: 'coding',
    },
  ];

  useEffect(() => {
    // Shuffle and select 4 random suggestions
    const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
    setSuggestions(shuffled.slice(0, 4));
  }, []);

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
        What would you like to do?
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className='group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left'
          >
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200'>
                {suggestion.icon}
              </div>
              <div>
                <h3 className='font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200'>
                  {suggestion.title}
                </h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  {suggestion.prompt}
                </p>
              </div>
            </div>
            <div className='absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-200' />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionCards;
