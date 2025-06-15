import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';
import { FileAttachment } from '@/lib/types';
import { documentParser } from '@/lib/parsers';
import { ApiResponse, ParserResult } from '@/lib/parsers/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function formatAttachmentsForLLM(parsedFiles: ParserResult[]): string {
  if (!parsedFiles || parsedFiles.length === 0) return '';

  return parsedFiles
    .map((file) => {
      let content = `File: ${file.name}\nType: ${file.type}\nSize: ${file.size}\n`;

      if (file.content) {
        content += `\nContent:\n${file.content}`;
      }

      return content;
    })
    .join('\n\n---\n\n');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { conversation, model = 'llama3-8b-8192' } = req.body;

    if (
      !conversation ||
      !Array.isArray(conversation) ||
      conversation.length === 0
    ) {
      return res.status(400).json({ error: 'Invalid conversation format' });
    }

    const messages = [...conversation];
    const lastUserMessage = messages[messages.length - 1];

    if (
      lastUserMessage.role === 'user' &&
      lastUserMessage.attachments?.length > 0
    ) {
      try {
        const parsedFiles = await Promise.all(
          lastUserMessage.attachments.map(async (file: FileAttachment) => {
            try {
              return await documentParser.parseFile(file);
            } catch (error) {
              console.error(`Error parsing file ${file.name}:`, error);
              return {
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                content: `Error processing file: ${(error as Error).message}`,
              };
            }
          })
        );

        const fileContent = formatAttachmentsForLLM(parsedFiles);
        if (fileContent) {
          lastUserMessage.content = `${lastUserMessage.content}\n\n${fileContent}`;
        }
      } catch (error) {
        console.error('Error processing attachments:', error);
        return res.status(500).json({
          error: 'Error processing file attachments',
          details: (error as Error).message,
        });
      }
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(({ role, content }) => ({ role, content })),
        model: model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return res.status(200).json({
        response: completion.choices[0].message.content || '',
      });
    } catch (error) {
      console.error('Groq API error:', error);
      if ((error as Error).message.includes('token')) {
        return res.status(400).json({
          error: 'Token limit exceeded',
          details: (error as Error).message,
        });
      }
      return res.status(500).json({
        error: 'Error communicating with Groq API',
        details: (error as Error).message,
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return res.status(500).json({
      error: 'Error processing your request',
      details: (error as Error).message,
    });
  }
}
