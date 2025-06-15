import { DocumentParser, ParsedDocument, MimeType } from './types';
import textract from 'textract';
import { detectLanguage } from './utils/language-detector';

export class GenericParser implements DocumentParser {
  supportedTypes: MimeType[] = [
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/json',
    'application/javascript',
    'application/typescript',
    'application/x-javascript',
    'text/javascript',
    'text/jsx',
    'text/typescript',
    'text/tsx',
    'text/css',
    'text/html',
    'text/xml',
    'text/yaml',
    'text/x-yaml',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
  ];

  private async extractTextFromBuffer(
    buffer: Buffer,
    mimeType: MimeType
  ): Promise<string> {
    // For text-based files, try direct buffer conversion first
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/javascript' ||
      mimeType === 'application/typescript' ||
      mimeType === 'application/json'
    ) {
      try {
        const text = buffer.toString('utf-8');
        // Validate that the text is readable
        if (text && text.length > 0) {
          return text;
        }
      } catch (error) {
        console.warn(
          'Failed to convert buffer to text directly, falling back to textract:',
          error
        );
      }
    }

    // Fall back to textract for other formats or if direct conversion fails
    return new Promise((resolve, reject) => {
      textract.fromBufferWithMime(
        mimeType,
        buffer,
        { preserveLineBreaks: true, preserveOnlyMultipleLineBreaks: true },
        (error: Error | null, text: string) => {
          if (error) {
            console.error('Error parsing document with textract:', error);
            reject(new Error(`Failed to parse document: ${error.message}`));
            return;
          }
          resolve(text || '');
        }
      );
    });
  }

  private async detectFileType(
    buffer: Buffer,
    mimeType: MimeType
  ): Promise<{ language: string; type: string }> {
    // If mime type is already specific, use it
    if (mimeType !== 'text/plain') {
      const type = mimeType.split('/').pop() || '';
      return { language: type, type: mimeType };
    }

    // For text/plain, try to detect the actual type
    const text = buffer.toString('utf-8').slice(0, 1000); // Look at first 1000 chars
    const language = await detectLanguage(text);

    // Map detected language to mime type
    const mimeTypeMap: { [key: string]: string } = {
      javascript: 'application/javascript',
      typescript: 'application/typescript',
      jsx: 'text/jsx',
      tsx: 'text/tsx',
      json: 'application/json',
      html: 'text/html',
      css: 'text/css',
      xml: 'text/xml',
      yaml: 'text/yaml',
      markdown: 'text/markdown',
      csv: 'text/csv',
    };

    return {
      language,
      type: mimeTypeMap[language] || 'text/plain',
    };
  }

  async parse(buffer: Buffer, mimeType: MimeType): Promise<ParsedDocument> {
    try {
      // Detect actual file type if it's text/plain
      const { language, type } = await this.detectFileType(buffer, mimeType);

      // Extract text content
      const text = await this.extractTextFromBuffer(buffer, type);

      // Generate metadata
      const metadata = {
        type: type,
        language: language,
        size: buffer.length,
        lines: text.split('\n').length,
        characters: text.length,
        // Add code-specific metadata
        ...(type.includes('javascript') || type.includes('typescript')
          ? {
              hasJsx: text.includes('</') || text.includes('/>'),
              hasImports: text.includes('import ') || text.includes('require('),
              hasExports:
                text.includes('export ') || text.includes('module.exports'),
            }
          : {}),
        // Add markdown-specific metadata
        ...(type === 'text/markdown'
          ? {
              hasHeaders: (text.match(/^#+\s/gm) || []).length,
              hasLinks: (text.match(/\[.*?\]\(.*?\)/g) || []).length,
              hasCodeBlocks: (text.match(/```[\s\S]*?```/g) || []).length,
            }
          : {}),
      };

      return {
        text,
        metadata,
      };
    } catch (error) {
      console.error('Error in GenericParser:', error);
      // Return a more informative error
      throw new Error(
        `Failed to parse ${mimeType} file: ${(error as Error).message}`
      );
    }
  }
}
