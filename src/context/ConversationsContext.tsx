'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

export interface Message {
  role: string;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  userId: string;
}

interface ConversationsContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: () => void;
  updateConversation: (id: string, messages: Message[]) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearAllConversations: () => void;
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

export function ConversationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
    if (user) {
      const savedConversations = localStorage.getItem(
        `conversations_${user.id}`
      );
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!mounted || !user) return;
    localStorage.setItem(
      `conversations_${user.id}`,
      JSON.stringify(conversations)
    );
  }, [conversations, mounted, user]);

  const createConversation = () => {
    if (!user) return;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      timestamp: Date.now(),
      userId: user.id,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const updateConversation = (id: string, messages: Message[]) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              messages,
              title:
                messages[0]?.content.slice(0, 30) + '...' || 'New Conversation',
            }
          : conv
      )
    );

    if (currentConversation?.id === id) {
      setCurrentConversation((prev) =>
        prev
          ? {
              ...prev,
              messages,
              title:
                messages[0]?.content.slice(0, 30) + '...' || 'New Conversation',
            }
          : null
      );
    }
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const clearAllConversations = () => {
    // Clear all conversation-related items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('conversations_')) {
        localStorage.removeItem(key);
      }
    }
    setConversations([]);
    setCurrentConversation(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        currentConversation,
        createConversation,
        updateConversation,
        deleteConversation,
        setCurrentConversation,
        clearAllConversations,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      'useConversations must be used within a ConversationsProvider'
    );
  }
  return context;
}
