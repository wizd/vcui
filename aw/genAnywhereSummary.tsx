'use client';

import { useState, useEffect } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';

// 允许流式响应最多30秒
export const maxDuration = 30;

const system = 'You are a professional, authentic email reader and intelligent collector.';
const prompt = `Text bellow delimited by 3 backticks is an email thread, respect the email rules and format, summary only the latest reply. Output in Chinese without any additional text.

\`\`\`{{text}}\`\`\`

`;

export default function GenAnywhereSummary({ text }: { text: string }) {
  const [generation, setGeneration] = useState<string>('');

  useEffect(() => {
    const generateText = async () => {
      const cleanedText = text.replace(/<[^>]*>/g, '');
      const { output } = await generate(prompt.replace('{{text}}', cleanedText), system);

      for await (const delta of readStreamableValue(output)) {
        setGeneration(currentGeneration => `${currentGeneration}${delta}`);
      }
    };

    generateText();
  }, [text]);

  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>{generation?.replace(/`/g, '')}</div>
  );
}