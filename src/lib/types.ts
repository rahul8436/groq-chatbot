export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  content: string; // Base64 encoded content
  url?: string; // Optional URL for images
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
}

export interface ModelConfig {
  id: string;
  name: string;
  developer: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  maxFileSize?: number;
  category: 'chat' | 'audio' | 'guard' | 'speech' | 'system';
  isProduction?: boolean;
}
