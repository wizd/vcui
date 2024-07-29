'use client';

import { useState, useEffect } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';

// 允许流式响应最多30秒
export const maxDuration = 30;

const system = 'You are a professional, authentic machine translation engine.';
const prompt = `Translate the following text delimited by 3 backticks to {{to}}, Output translation directly without any additional text, don't wrap the output with any backticks.

\`\`\`{{text}}\`\`\`

`;

export default function GenAnywhereTranslator({ text, to }: { text: string, to: string }) {
  const [generation, setGeneration] = useState<string>('');

  useEffect(() => {
    const generateText = async () => {
      const cleanedText = text.replace(/<[^>]*>/g, '');
      const { output } = await generate(prompt.replace('{{text}}', cleanedText).replace('{{to}}', to), system);

      for await (const delta of readStreamableValue(output)) {
        setGeneration(currentGeneration => `${currentGeneration}${delta}`);
      }
    };

    generateText();
  }, [text, to]);

  return (
    <div>{generation?.replace(/`/g, '')}</div>
  );
}