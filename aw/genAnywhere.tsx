'use client';

import { readStreamableValue } from 'ai/rsc';
import { useEffect, useState } from 'react';

import { generate } from './genAnywhere_server';

export const maxDuration = 30;

export default function GenAnywhere({ text }: { text: string }) {
  const [generation, setGeneration] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const generateText = async () => {
      setDebugInfo(`输入文本: ${text}`);
      const { output } = await generate(text);
      let fullGeneration = '';
      for await (const delta of readStreamableValue(output)) {
        fullGeneration += delta;
        setGeneration(fullGeneration);
      }
      setDebugInfo((prevInfo) => `${prevInfo}\n最终翻译: ${fullGeneration}`);
    };

    generateText();
  }, [text]);

  return (
    <div>
      <div>{generation}</div>
      <pre>{debugInfo}</pre>
    </div>
  );
}
