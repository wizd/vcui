'use client';

import { useState, useEffect } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';

// 允许流式响应最多30秒
export const maxDuration = 30;

export default function GenAnywhere({ text }: { text: string }) {
  const [generation, setGeneration] = useState<string>('');

  useEffect(() => {
    const generateText = async () => {
      const { output } = await generate(text);

      for await (const delta of readStreamableValue(output)) {
        setGeneration(currentGeneration => `${currentGeneration}${delta}`);
      }
    };

    generateText();
  }, [text]);

  return (
    <div>{generation}</div>
  );
}