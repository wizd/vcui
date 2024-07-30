'use client';

import { useState, useEffect } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';

export const maxDuration = 30;

export default function GenAnywhere({ text, onGenerationComplete }: { text: string, onGenerationComplete: (data: any) => void }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateJson = async () => {
      setIsLoading(true);
      const { output } = await generate(text);
      let fullGeneration = '';
      for await (const delta of readStreamableValue(output)) {
        fullGeneration += delta;
      }
      
      try {
        const jsonObject = JSON.parse(fullGeneration);
        onGenerationComplete(jsonObject);
      } catch (error) {
        console.error('生成的内容不是有效的JSON:', error);
        onGenerationComplete(null);
      }
      
      setIsLoading(false);
    };
    generateJson();
  }, [text, onGenerationComplete]);

  return (
    <div>
      {isLoading ? '正在生成...' : '生成完成'}
    </div>
  );
}