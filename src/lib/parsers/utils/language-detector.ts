// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript: [
    /^(import|export|const|let|var|function|class|=>|async|await)/m,
    /(\.js|\.jsx|\.mjs)$/,
    /(require\(|module\.exports)/,
    /(console\.log|window\.|document\.)/,
  ],
  typescript: [
    /^(import|export|const|let|var|function|class|=>|async|await|interface|type|enum)/m,
    /(\.ts|\.tsx)$/,
    /(: string|: number|: boolean|: any|: void|: never)/,
  ],
  jsx: [
    /(<[A-Z][a-zA-Z]*>|<\/[A-Z][a-zA-Z]*>)/,
    /(className=|onClick=|onChange=|useState|useEffect)/,
    /(React\.|react-dom)/,
  ],
  tsx: [
    /(<[A-Z][a-zA-Z]*>|<\/[A-Z][a-zA-Z]*>)/,
    /(className=|onClick=|onChange=|useState|useEffect)/,
    /(: React\.FC|: JSX\.Element)/,
  ],
  json: [/^\s*[{[]/, /"([^"]+)":\s*["[{]/, /(true|false|null)/],
  html: [
    /<!DOCTYPE html>|<html|<head|<body|<div|<span|<p|<h[1-6]/i,
    /<[a-z]+[^>]*>/i,
    /<\/[a-z]+>/i,
  ],
  css: [/{[^}]*}/, /([a-z-]+):\s*[^;]+;/, /(@media|@keyframes|@import)/],
  xml: [/<\?xml/, /<[a-z]+:[a-z]+/i, /<\/[a-z]+:[a-z]+>/i],
  yaml: [/^[a-zA-Z0-9_-]+:/m, /^[ ]*- /m, /^[ ]*[a-zA-Z0-9_-]+:/m],
  markdown: [/^#+\s/m, /\[.*?\]\(.*?\)/, /```[\s\S]*?```/],
  csv: [/^[^,]+,[^,]+(,[^,]+)*$/m, /^".*?",.*?$/m],
} as const;

type Language = keyof typeof LANGUAGE_PATTERNS;

export async function detectLanguage(text: string): Promise<Language> {
  // Count matches for each language
  const scores: { [key in Language]: number } = {} as {
    [key in Language]: number;
  };

  // Initialize scores
  Object.keys(LANGUAGE_PATTERNS).forEach((lang) => {
    scores[lang as Language] = 0;
  });

  // Check each pattern
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[lang as Language] += matches.length;
      }
    }
  }

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLang: Language = 'javascript'; // Default to javascript

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang as Language;
    }
  }

  // Special case for JSX/TSX
  if (detectedLang === 'javascript' && scores.jsx > 0) {
    detectedLang = 'jsx';
  } else if (detectedLang === 'typescript' && scores.tsx > 0) {
    detectedLang = 'tsx';
  }

  return detectedLang;
}
