'use server';

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generate(input: string) {
  const stream = createStreamableValue('');

  (async () => {
    
    const openai = createOpenAI({
        baseURL: 'http://192.168.3.80:5010/v1',
        apiKey: 'aaa'
    });

    const { textStream } = await streamText({
      model: openai('gpt-4'),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}