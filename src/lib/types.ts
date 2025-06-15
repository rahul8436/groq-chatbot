export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  developer: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  maxFileSize?: number;
  category: 'chat' | 'audio' | 'guard';
  isProduction?: boolean;
}
