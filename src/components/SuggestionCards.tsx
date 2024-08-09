"use client";

import React from 'react';

const SuggestionCards = () => {
  const suggestions = [
    { icon: '🎓', title: 'Overcome procrastination' },
    { icon: '👚', title: 'Pick outfit to look good on camera' },
    { icon: '✉️', title: 'Text inviting friend to wedding' },
    { icon: '🏙️', title: 'Activities to make friends in new city' },
  ];

  return (
    <div className='grid grid-cols-2 gap-4'>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className='bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700'
        >
          <span className='text-2xl mb-2'>{suggestion.icon}</span>
          <h3 className='text-sm'>{suggestion.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default SuggestionCards;
