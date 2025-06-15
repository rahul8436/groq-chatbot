'use client';

import React from 'react';
import { ModelConfig } from '@/lib/types';
import { getModelsByCategory } from '@/lib/models';
import { FaChevronDown } from 'react-icons/fa';

interface ModelSelectorProps {
  selectedModel: ModelConfig;
  onModelChange: (model: ModelConfig) => void;
  category?: ModelConfig['category'];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  category = 'chat',
}) => {
  const models = getModelsByCategory(category).sort((a, b) => {
    // Sort by production status first
    if (a.isProduction && !b.isProduction) return -1;
    if (!a.isProduction && b.isProduction) return 1;
    // Then by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className='flex items-center gap-4'>
      <div className='relative inline-block text-left'>
        <select
          value={selectedModel.id}
          onChange={(e) => {
            const model = models.find((m) => m.id === e.target.value);
            if (model) onModelChange(model);
          }}
          className='appearance-none bg-transparent pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none cursor-pointer min-w-[200px] border border-gray-300 dark:border-gray-600 rounded-md'
        >
          <optgroup label='Production Models'>
            {models
              .filter((m) => m.isProduction)
              .map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  className='bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  {model.name}
                </option>
              ))}
          </optgroup>
          <optgroup label='Experimental Models'>
            {models
              .filter((m) => !m.isProduction)
              .map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  className='bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  {model.name} (Experimental)
                </option>
              ))}
          </optgroup>
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400'>
          <FaChevronDown size={12} />
        </div>
      </div>

      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
        {selectedModel.contextWindow && (
          <span className='flex items-center gap-1'>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Context:
            </span>
            {selectedModel.contextWindow.toLocaleString()} tokens
          </span>
        )}
        {selectedModel.maxCompletionTokens && (
          <span className='flex items-center gap-1'>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Max:
            </span>
            {selectedModel.maxCompletionTokens.toLocaleString()} tokens
          </span>
        )}
        {!selectedModel.isProduction && (
          <span className='text-yellow-600 dark:text-yellow-400'>
            (Experimental)
          </span>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
