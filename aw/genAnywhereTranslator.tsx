'use client';

import { readStreamableValue } from 'ai/rsc';
import { useEffect, useMemo, useState } from 'react';

import { generate } from './genAnywhere_server';

// 允许流式响应最多30秒
export const maxDuration = 30;

const system = 'You are a professional, authentic machine translation engine.';
const prompt = `Translate the following text delimited by 3 backticks to {{to}}, Output translation directly without any additional text, don't wrap the output with any backticks.

\`\`\`{{text}}\`\`\`

`;

export default function GenAnywhereTranslator({
  text,
  to,
}: {
  text: string;
  to: string;
}) {
  const [generation, setGeneration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = useMemo(() => `translation_${text}_${to}`, [text, to]);

  useEffect(() => {
    const storedTranslation = localStorage.getItem(storageKey);

    const generateText = async () => {
      if (storedTranslation) {
        setGeneration(storedTranslation);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setGeneration('');
      const cleanedText = text.replace(/<[^>]*>/g, '');
      const { output } = await generate(
        prompt.replace('{{text}}', cleanedText).replace('{{to}}', to),
        system,
      );

      let fullTranslation = '';
      for await (const delta of readStreamableValue(output)) {
        fullTranslation += delta;
        setGeneration((currentGeneration) => `${currentGeneration}${delta}`);
      }
      localStorage.setItem(storageKey, fullTranslation);
      setIsLoading(false);
    };

    generateText();
  }, [storageKey]);

  const memoizedGeneration = useMemo(() => {
    return isLoading ? '翻译中...' : generation?.replace(/`/g, '');
  }, [isLoading, generation]);

  return <div>{memoizedGeneration}</div>;
}
