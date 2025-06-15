import { DocumentParser, ParsedDocument, MimeType } from './types';
import { parse as parsePPTX } from 'pptx2json';

export class PowerPointParser implements DocumentParser {
  supportedTypes: MimeType[] = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ];

  async parse(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const result = await parsePPTX(buffer);
      const slides = result.slides || [];
      const content = slides
        .map((slide: any, index: number) => {
          const text = slide.texts?.map((t: any) => t.text).join('\n') || '';
          return `Slide ${index + 1}:\n${text}`;
        })
        .join('\n\n');

      return {
        text: content,
        metadata: {
          slides: slides.length,
          title: result.core?.title,
          author: result.core?.author,
          creationDate: result.core?.created,
          modificationDate: result.core?.modified,
        },
      };
    } catch (error) {
      console.error('Error parsing PowerPoint document:', error);
      throw new Error('Failed to parse PowerPoint document');
    }
  }
}
