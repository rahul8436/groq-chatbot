# Groq Chatbot

A modern chatbot application built with Next.js, Groq, and advanced document parsing capabilities.

## Features

- 🤖 Powered by Groq's fast LLM API
- 📄 Advanced document parsing for:
  - PDF files (text, tables, metadata)
  - Word documents (text, tables, metadata)
  - Images (text, tables, objects, faces, scenes)
- 💬 Real-time chat interface
- 🎨 Modern, responsive UI
- 🔒 Secure file handling
- 🌐 Serverless deployment

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **AI/ML**:
  - Groq API for chat
  - Tesseract.js for OCR
  - TensorFlow.js for object detection
  - PDF.js for PDF parsing
  - Mammoth for Word documents
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Groq API key.

4. Run the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key
- `NEXT_PUBLIC_MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

## Development

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn lint`: Run ESLint
- `yarn test`: Run tests

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
