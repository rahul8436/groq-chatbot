import { DocumentParser, ParsedDocument, MimeType } from './types';
// @ts-ignore
import pdfParse from 'pdf-parse';

export class PDFParser implements DocumentParser {
  supportedTypes: MimeType[] = ['application/pdf'];

  async parse(buffer: Buffer, mimeType: MimeType): Promise<ParsedDocument> {
    try {
      const data = await pdfParse(buffer);

      return {
        text: data.text,
        metadata: {
          pages: data.numpages,
          title: data.info?.Title,
          author: data.info?.Author,
          keywords: data.info?.Keywords?.split(',').map((k: string) =>
            k.trim()
          ),
          creationDate: data.info?.CreationDate,
          modificationDate: data.info?.ModDate,
        },
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF document');
    }
  }
}
