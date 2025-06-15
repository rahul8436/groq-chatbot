import { DocumentParser, ParsedDocument, MimeType } from './types';
import * as XLSX from 'xlsx';

export class ExcelParser implements DocumentParser {
  supportedTypes: MimeType[] = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  async parse(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheets = workbook.SheetNames;
      const content: string[] = [];

      sheets.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        content.push(`Sheet: ${sheetName}\n${JSON.stringify(data, null, 2)}`);
      });

      const metadata = {
        properties: {
          title: workbook.Props?.Title,
          author: workbook.Props?.Author,
          creationDate: workbook.Props?.CreatedDate?.toISOString(),
          modificationDate: workbook.Props?.ModifiedDate?.toISOString(),
        },
      };

      return {
        text: content.join('\n\n'),
        metadata: {
          sheets: sheets,
          tables: sheets.length,
          ...metadata.properties,
        },
      };
    } catch (error) {
      console.error('Error parsing Excel document:', error);
      throw new Error('Failed to parse Excel document');
    }
  }
}
