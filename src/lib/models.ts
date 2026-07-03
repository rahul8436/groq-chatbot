import { ModelConfig } from './types';

export const models: ModelConfig[] = [
  // ── Chat Models ────────────────────────────────────────────
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    developer: 'OpenAI',
    contextWindow: 131072,
    maxCompletionTokens: 65536,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    developer: 'OpenAI',
    contextWindow: 131072,
    maxCompletionTokens: 65536,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    developer: 'Meta',
    contextWindow: 131072,
    maxCompletionTokens: 32768,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    developer: 'Meta',
    contextWindow: 131072,
    maxCompletionTokens: 131072,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B 16E',
    developer: 'Meta',
    contextWindow: 131072,
    maxCompletionTokens: 8192,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    developer: 'Alibaba Cloud',
    contextWindow: 131072,
    maxCompletionTokens: 40960,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'qwen/qwen3.6-27b',
    name: 'Qwen 3.6 27B',
    developer: 'Alibaba Cloud',
    contextWindow: 131072,
    maxCompletionTokens: 32768,
    category: 'chat',
    isProduction: true,
  },
  {
    id: 'allam-2-7b',
    name: 'ALLaM 2 7B',
    developer: 'SDAIA',
    contextWindow: 4096,
    maxCompletionTokens: 4096,
    category: 'chat',
    isProduction: false,
  },

  // ── Guard / Safety Models ──────────────────────────────────
  {
    id: 'openai/gpt-oss-safeguard-20b',
    name: 'Safety GPT OSS 20B',
    developer: 'OpenAI',
    contextWindow: 131072,
    maxCompletionTokens: 65536,
    category: 'guard',
    isProduction: true,
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-22m',
    name: 'Llama Prompt Guard 2 22M',
    developer: 'Meta',
    contextWindow: 512,
    category: 'guard',
    isProduction: false,
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-86m',
    name: 'Prompt Guard 2 86M',
    developer: 'Meta',
    contextWindow: 512,
    category: 'guard',
    isProduction: false,
  },

  // ── Audio (Speech-to-Text) Models ──────────────────────────
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large V3',
    developer: 'OpenAI',
    maxFileSize: 25 * 1024 * 1024,
    category: 'audio',
    isProduction: true,
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large V3 Turbo',
    developer: 'OpenAI',
    maxFileSize: 25 * 1024 * 1024,
    category: 'audio',
    isProduction: true,
  },

  // ── Speech (Text-to-Speech) Models ─────────────────────────
  {
    id: 'canopylabs/orpheus-v1-english',
    name: 'Orpheus V1 English',
    developer: 'Canopy Labs',
    contextWindow: 4000,
    maxCompletionTokens: 50000,
    category: 'speech',
    isProduction: true,
  },
  {
    id: 'canopylabs/orpheus-arabic-saudi',
    name: 'Orpheus Arabic Saudi',
    developer: 'Canopy Labs',
    contextWindow: 4000,
    maxCompletionTokens: 50000,
    category: 'speech',
    isProduction: true,
  },

  // ── Compound / Agentic Systems ─────────────────────────────
  {
    id: 'groq/compound',
    name: 'Compound',
    developer: 'Groq',
    contextWindow: 131072,
    maxCompletionTokens: 8192,
    category: 'system',
    isProduction: false,
  },
  {
    id: 'groq/compound-mini',
    name: 'Compound Mini',
    developer: 'Groq',
    contextWindow: 131072,
    maxCompletionTokens: 8192,
    category: 'system',
    isProduction: false,
  },
];

export const defaultModel = models.find(
  (m) => m.id === 'llama-3.3-70b-versatile'
)!;

export const getModelsByCategory = (category: ModelConfig['category']) => {
  return models.filter((m) => m.category === category);
};
