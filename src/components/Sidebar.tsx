'use client';

import React, { useState } from 'react';
import { useConversations } from '../context/ConversationsContext';
import { useUser } from '../context/UserContext';
import {
  FaPlus,
  FaTrash,
  FaSignOutAlt,
  FaHistory,
  FaBroom,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AlertDialog from './AlertDialog';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const {
    conversations,
    currentConversation,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    clearAllConversations,
  } = useConversations();
  const { user, logout } = useUser();
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

  const handleLogout = () => {
    setAlertConfig({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      onConfirm: () => {
        logout();
        toast.success('Logged out successfully!');
      },
    });
    setShowAlert(true);
  };

  const handleDeleteConversation = (conversationId: string) => {
    setAlertConfig({
      title: 'Delete Conversation',
      message:
        'Are you sure you want to delete this conversation? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        deleteConversation(conversationId);
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
        toast.success('Conversation deleted!');
      },
    });
    setShowAlert(true);
  };

  const handleClearAllConversations = () => {
    setAlertConfig({
      title: 'Clear All Conversations',
      message:
        'Are you sure you want to delete all conversations? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        clearAllConversations();
      },
    });
    setShowAlert(true);
  };

  return (
    <div className='w-64 h-screen bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <UserAvatar name={user?.name || ''} size='md' />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {user?.name}
            </h2>
          </div>
          <button
            onClick={handleLogout}
            className='p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none transition-colors duration-200'
            title='Logout'
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>

      <div className='p-4'>
        <button
          onClick={createConversation}
          className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200'
        >
          <FaPlus size={14} />
          New Chat
        </button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='px-4 space-y-2'>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                currentConversation?.id === conversation.id
                  ? 'bg-blue-100 dark:bg-blue-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => setCurrentConversation(conversation)}
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                  {conversation.title}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {new Date(conversation.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation.id);
                }}
                className='p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='p-4 space-y-2 border-t border-gray-200 dark:border-gray-700'>
        <button
          onClick={handleClearAllConversations}
          className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200'
        >
          <FaBroom size={14} />
          Clear All Conversations
        </button>
        <ThemeToggle />
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
}
