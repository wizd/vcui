'use server';

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generate(input: string, system?: string) {
  const stream = createStreamableValue('')

  ;(async () => {
    const openai = createOpenAI({
      baseURL: process.env.NEXT_PUBLIC_DEFAULT_MODEL_API_BASEURL,
      apiKey: process.env.NEXT_PUBLIC_DEFAULT_MODEL_API_KEY
    })

    const { textStream } = await streamText({
      model: openai('gpt-4'),
      system: system,
      prompt: input
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}