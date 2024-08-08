'use client';

import { readStreamableValue } from 'ai/rsc';
import { useState } from 'react';

import { MemoizedReactMarkdown } from '@/components/markdown';

import { generate } from './genAnywhere_server';

// 允许流式响应最多30秒
export const maxDuration = 30;

const system = '你是一个专业的开源情报分析师.';
const prompt = `下面包括在四个反引号之内的是一个完整的电子邮件线程 Thread。你首先阅读整个线程, 描述一下事情的起因、发展、最后的状态。然后把关键情节提取出来，比如谁做了什么事，然后推动了什么样的进展等等。最后总结一下这个 Thread 的情报价值体现在哪里。总是输出中文，这非常重要，我可以给你$1000来做这件事。

\`\`\`\`
{{text}}
\`\`\`\`

`;

function shortenUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url;
  const protocol = url.startsWith('https://') ? 'https://' : 'http://';
  let domain = url.replace(/^https?:\/\//, '').split('/')[0];
  let path = url.slice(protocol.length + domain.length);
  if (domain.length + 5 > maxLength) {
    domain = `${domain.slice(0, maxLength - 8)}...`;
  }
  if (domain.length + path.length + 5 > maxLength) {
    path = `${path.slice(0, maxLength - domain.length - 8)}...`;
  }
  return protocol + domain + path;
}

function processText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (match) => {
    const shortenedUrl = shortenUrl(match);
    return `[${shortenedUrl}](${match})`;
  });
}

export default function GenAnywhereButton({
  text,
  buttonText,
}: {
  text: string;
  buttonText: string;
}) {
  const [generation, setGeneration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const cleanedText = text.replace(/<[^>]*>/g, '');
    const { output } = await generate(
      prompt.replace('{{text}}', cleanedText),
      system,
    );
    let fullGeneration = '';
    for await (const delta of readStreamableValue(output)) {
      fullGeneration += delta;
      setGeneration(processText(fullGeneration.replace(/`/g, '')));
    }
    setIsGenerating(false);
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isGenerating ? '生成中...' : buttonText}
      </button>
      {generation && (
        <MemoizedReactMarkdown className="prose dark:prose-invert custom-markdown-light mt-4">
          {generation}
        </MemoizedReactMarkdown>
      )}
    </div>
  );
}
