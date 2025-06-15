export type MimeType = string;
export type FileExtension = string;
export type Language = string;

export interface ParsedDocument {
  text: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  keywords?: string[];
  creationDate?: string;
  modificationDate?: string;
  pages?: number;
  sheets?: string[];
  slides?: number;
  tables?: number;
  images?: number;
  type?: string;
  size?: number;
  [key: string]: any;
}

export interface DocumentParser {
  parse(buffer: Buffer): Promise<ParsedDocument>;
  supportedTypes: MimeType[];
}

export interface ParserResult {
  name: string;
  type: MimeType;
  size: string;
  summary: string;
  content?: string;
  language?: Language;
  metadata?: DocumentMetadata;
}

export const DOCUMENT_TYPES = {
  // Microsoft Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/msword': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  // OpenDocument
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  // Other
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'application/json': 'json',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];
