import type { NextApiRequest, NextApiResponse } from 'next';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, feedback } = req.body;

    // Validate input
    if (!name || !email || !feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Instead of sending email directly, return the necessary data for client-side sending
    return res.status(200).json({
      success: true,
      emailData: {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: 'traactautomation@gmail.com',
          to_name: 'Rahul',
          from_name: name,
          from_email: email,
          message: feedback,
          reply_to: email,
          subject: 'New Feedback from Groq Chatbot',
        },
      },
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
