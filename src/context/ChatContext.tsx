import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Message, defaultModel, ModelConfig } from '@/lib/models';

// ... existing interfaces ...

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  selectedModel: ModelConfig;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  setSelectedModel: (model: ModelConfig) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(defaultModel);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const userMessage: Message = {
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model: selectedModel.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedModel]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        selectedModel,
        sendMessage,
        clearConversation,
        setSelectedModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ... rest of the file stays the same ...
