import {
  DocumentParser,
  MimeType,
  ParserResult,
  FileAttachment,
} from './types';
import { PDFParser } from './pdf-parser';
import { WordParser } from './word-parser';
import { ExcelParser } from './excel-parser';
import { PowerPointParser } from './powerpoint-parser';
import { GenericParser } from './generic-parser';
// import { ImageParser } from './image-parser';

export class DocumentParserFactory {
  private parsers: DocumentParser[];

  constructor() {
    this.parsers = [
      new PDFParser(),
      new WordParser(),
      new ExcelParser(),
      new PowerPointParser(),
      // new ImageParser(),
      new GenericParser(),
    ];
  }

  private getParser(mimeType: MimeType): DocumentParser {
    const parser = this.parsers.find((p) =>
      p.supportedTypes.includes(mimeType)
    );
    if (!parser) {
      throw new Error(`No parser found for mime type: ${mimeType}`);
    }
    return parser;
  }

  private generateSummary(docType: string, metadata: any): string {
    if (metadata.summary) {
      return metadata.summary;
    }

    switch (docType) {
      case 'docx':
      case 'doc':
        return `Word document${
          metadata.pages ? ` with ${metadata.pages} pages` : ''
        }${metadata.title ? ` - "${metadata.title}"` : ''}`;
      case 'xlsx':
      case 'xls':
        return `Excel workbook with ${metadata.sheets?.length || 0} sheets${
          metadata.title ? ` - "${metadata.title}"` : ''
        }`;
      case 'pptx':
      case 'ppt':
        return `PowerPoint presentation with ${metadata.slides || 0} slides${
          metadata.title ? ` - "${metadata.title}"` : ''
        }`;
      case 'pdf':
        return `PDF document with ${metadata.pages || 0} pages${
          metadata.title ? ` - "${metadata.title}"` : ''
        }`;
      default:
        return `${docType.toUpperCase()} document`;
    }
  }

  async parseFile(file: FileAttachment): Promise<ParserResult> {
    const buffer = Buffer.from(file.content.split(',')[1], 'base64');
    const parser = this.getParser(file.type);
    const docType = file.type.split('/').pop()?.split('.').pop() || '';

    try {
      const parsedDoc = await parser.parse(buffer, file.type);

      return {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)}KB`,
        summary: this.generateSummary(docType, parsedDoc.metadata),
        content: parsedDoc.text,
        metadata: parsedDoc.metadata,
      };
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error);
      return {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)}KB`,
        summary: 'Error processing file content',
        metadata: { error: (error as Error).message },
      };
    }
  }
}

// Export a singleton instance
export const documentParser = new DocumentParserFactory();
