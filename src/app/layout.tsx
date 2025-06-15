import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { ConversationsProvider } from '../context/ConversationsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoderHelper',
  description: 'Your AI coding assistant',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#343541' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta name='theme-color' content='#343541' />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <UserProvider>
            <ConversationsProvider>{children}</ConversationsProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
