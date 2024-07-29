'use client';

import { useState, useEffect, useRef } from 'react';
import { generate } from './genAnywhere_server';
import { readStreamableValue } from 'ai/rsc';
import { MemoizedReactMarkdown } from '@/components/markdown';

// 允许流式响应最多30秒
export const maxDuration = 30;

const system = 'You are a professional, authentic email reader and intelligent collector.';
const prompt = `Text bellow delimited by 3 backticks is an email thread, respect the email rules and format, summary only the latest reply. Output in Chinese without any additional text.

\`\`\`{{text}}\`\`\`

`;

function shortenUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url;
  const protocol = url.startsWith('https://') ? 'https://' : 'http://';
  let domain = url.replace(/^https?:\/\//, '').split('/')[0];
  let path = url.slice(protocol.length + domain.length);
  if (domain.length + 5 > maxLength) {
    domain = domain.slice(0, maxLength - 8) + '...';
  }
  if (domain.length + path.length + 5 > maxLength) {
    path = path.slice(0, maxLength - domain.length - 8) + '...';
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

export default function GenAnywhereSummary({ text }: { text: string }) {
  const [generation, setGeneration] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // 当10%的组件可见时触发
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const generateText = async () => {
        const cleanedText = text.replace(/<[^>]*>/g, '');
        const { output } = await generate(prompt.replace('{{text}}', cleanedText), system);

        let fullGeneration = '';
        for await (const delta of readStreamableValue(output)) {
          fullGeneration += delta;
          setGeneration(processText(fullGeneration.replace(/`/g, '')));
        }
      };

      generateText();
    }
  }, [isVisible, text]);

  return (
    <div ref={componentRef}>
      <MemoizedReactMarkdown
        className="prose dark:prose-invert custom-markdown-light"
      >
        {generation}
      </MemoizedReactMarkdown>
    </div>
  );
}