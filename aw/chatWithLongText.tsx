'use client'
import React, { useEffect, useState } from 'react'
import {
  CountTokens,
  SplitTextByTokenCountPreserveSentences
} from '@/vcshare/tools/tokenCounter'
import ChatWithTask from './chatWithTask'

type ChatWithTaskProps = {
  prompt: string
  text: string
  splitByTokenCount?: number
  onFinish?: (result: string) => string
}

export default function ChatWithLongText({
  prompt,
  text,
  splitByTokenCount = 1024,
  onFinish
}: ChatWithTaskProps) {
  const [chunks, setChunks] = useState<string[]>([])

  useEffect(() => {
    const splitText = () => {
      const texts = SplitTextByTokenCountPreserveSentences(
        text,
        splitByTokenCount
      )
      console.log(
        `split long text with ${CountTokens(text)} tokens into ${texts.length} chunks`
      )
      setChunks(texts)
    }

    splitText()
  }, [text, splitByTokenCount]) // 添加依赖项，确保在 text 或 splitByTokenCount 变化时调用

  return (
    <>
      {chunks.map((chunk, i) => (
        <ChatWithTask
          key={i}
          prompt={prompt}
          text={chunk}
          onFinish={onFinish}
        />
      ))}
    </>
  )
}
