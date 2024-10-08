'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';

export async function generate(input: string, system?: string) {
  const stream = createStreamableValue('');

  (async () => {
    const openai = createOpenAI({
      baseURL: process.env.NEXT_PUBLIC_DEFAULT_MODEL_API_BASEURL,
      apiKey: process.env.NEXT_PUBLIC_DEFAULT_MODEL_API_KEY,
    });

    const { textStream } = await streamText({
      model: openai(process.env.NEXT_PUBLIC_DEFAULT_MODEL_NAME || 'gpt-4'),
      system,
      prompt: input,
      maxTokens: 2048,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
