import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { conversation } = req.body;

    try {
      const completion = await groq.chat.completions.create({
        messages: conversation,
        model: 'llama3-8b-8192',
      });

      res.status(200).json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error('Groq API error:', error);
      res.status(500).json({ error: 'Error processing your request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
