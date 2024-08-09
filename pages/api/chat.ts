import type { NextApiRequest, NextApiResponse } from 'next'
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: message }],
        model: "mixtral-8x7b-32768",
      });

      res.status(200).json({ response: completion.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Error processing your request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}