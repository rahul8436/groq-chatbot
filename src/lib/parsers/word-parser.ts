import { DocumentParser, ParsedDocument, MimeType } from './types';
import mammoth from 'mammoth';

export class WordParser implements DocumentParser {
  supportedTypes: MimeType[] = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  async parse(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const [textResult, metadataResult] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.extractMetadata({ buffer }),
      ]);

      return {
        text: textResult.value,
        metadata: {
          title: metadataResult.value.title,
          author: metadataResult.value.author,
          keywords: metadataResult.value.keywords,
          creationDate: metadataResult.value.creationDate,
          modificationDate: metadataResult.value.modificationDate,
          pages: textResult.value.split('\n\n').length, // Rough estimate
        },
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document');
    }
  }
}
