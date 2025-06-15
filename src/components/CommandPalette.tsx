import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaHistory,
  FaSave,
  FaTrash,
  FaMoon,
  FaSun,
  FaKeyboard,
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import AlertDialog from './AlertDialog';

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConversation: () => void;
  onClearConversation: () => void;
  onToggleTheme: () => void;
  onShowHistory: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSaveConversation,
  onClearConversation,
  onToggleTheme,
  onShowHistory,
}) => {
  const [search, setSearch] = useState('');
  const { theme } = useTheme();
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  const handleClearConversation = useCallback(() => {
    setAlertConfig({
      title: 'Clear Conversation',
      message:
        'Are you sure you want to clear the current conversation? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        onClearConversation();
        onClose();
      },
    });
    setShowAlert(true);
  }, [onClearConversation, onClose]);

  const commands: Command[] = [
    {
      id: 'save',
      name: 'Save Conversation',
      description: 'Save the current conversation',
      icon: <FaSave className='w-5 h-5' />,
      shortcut: '⌘S',
      action: onSaveConversation,
    },
    {
      id: 'clear',
      name: 'Clear Conversation',
      description: 'Clear the current conversation',
      icon: <FaTrash className='w-5 h-5' />,
      shortcut: '⌘K',
      action: handleClearConversation,
    },
    {
      id: 'history',
      name: 'View History',
      description: 'View conversation history',
      icon: <FaHistory className='w-5 h-5' />,
      shortcut: '⌘H',
      action: onShowHistory,
    },
    {
      id: 'theme',
      name: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon:
        theme === 'dark' ? (
          <FaSun className='w-5 h-5' />
        ) : (
          <FaMoon className='w-5 h-5' />
        ),
      shortcut: '⌘T',
      action: onToggleTheme,
    },
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.name.toLowerCase().includes(search.toLowerCase()) ||
      command.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        handleClearConversation();
      }
      if (e.metaKey && e.key === 's') {
        e.preventDefault();
        onSaveConversation();
      }
      if (e.metaKey && e.key === 'h') {
        e.preventDefault();
        onShowHistory();
      }
      if (e.metaKey && e.key === 't') {
        e.preventDefault();
        onToggleTheme();
      }
    },
    [
      onClose,
      handleClearConversation,
      onSaveConversation,
      onShowHistory,
      onToggleTheme,
    ]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div
            className='absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75'
            onClick={onClose}
          ></div>
        </div>

        <div className='inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Search commands...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className='mt-4 max-h-96 overflow-y-auto'>
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  className='w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none'
                  onClick={() => {
                    command.action();
                  }}
                >
                  <div className='flex-shrink-0 text-gray-500 dark:text-gray-400'>
                    {command.icon}
                  </div>
                  <div className='ml-3 flex-grow text-left'>
                    <p className='text-sm font-medium'>{command.name}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {command.description}
                    </p>
                  </div>
                  {command.shortcut && (
                    <div className='ml-4 flex-shrink-0'>
                      <kbd className='px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded'>
                        {command.shortcut}
                      </kbd>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          alertConfig.onConfirm();
          setShowAlert(false);
        }}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default CommandPalette;
