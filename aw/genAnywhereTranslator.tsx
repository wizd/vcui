'use client';

import { useState, useEffect } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';

// 允许流式响应最多30秒
export const maxDuration = 30;

const prompt = `You are a professional, authentic machine translation engine.
Translate the following source text to {{to}}, Output translation directly without any additional text.

<source>
{{text}}
</source>

`;

export default function GenAnywhereTranslator({ text, to }: { text: string, to: string }) {
  const [generation, setGeneration] = useState<string>('');

  useEffect(() => {
    const generateText = async () => {
      const { output } = await generate(prompt.replace('{{text}}', text).replace('{{to}}', to));

      for await (const delta of readStreamableValue(output)) {
        setGeneration(currentGeneration => `${currentGeneration}${delta}`);
      }
    };

    generateText();
  }, [text, to]);

  return (
    <div>{generation}</div>
  );
}