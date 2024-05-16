'use client'
import React, { useRef, RefObject, useEffect, useState } from 'react'
import { useChat } from 'ai/react'
import {
  CalculateInputTokenLimitForGenericInference,
  CutTextToTokenCount
} from '@/vcshare/tools/tokenCounter'
import { BsArrowRepeat, BsPlusCircle } from 'react-icons/bs'
import AnimatedPlusMenu from '../common/animatePlusMenu'

type ChatWithTaskProps = {
  prompt: string
  text: string
  showMenu?: boolean
  onFinish?: (result: string) => string
  onRedo?: () => void
  renderContent?: (content: string) => JSX.Element
  onExpand?: () => void
}

export default async function ChatWithTask({
  prompt,
  text,
  showMenu = true,
  onFinish,
  onRedo,
  renderContent,
  onExpand
}: ChatWithTaskProps) {
  const [displayText, setDisplayText] = useState<string | undefined>(undefined)
  const { input, messages, handleInputChange, handleSubmit, reload } = useChat({
    initialInput: prompt.includes('{context}')
      ? prompt.replace('{context}', text)
      : prompt +
        '\n\n' +
        (await CutTextToTokenCount(
          text,
          await CalculateInputTokenLimitForGenericInference(prompt, text, 2048)
        )),
    onFinish: msg => {
      setHasFinished(true)
      if (onFinish) {
        const altstr = onFinish(msg.content)
        setDisplayText(altstr)
      }
    }
  })
  const [hasFinished, setHasFinished] = useState(false) // 添加状态来跟踪是否完成

  useEffect(() => {
    handleFormSubmit() // 将原来的直接调用移到这个函数内部
  }, []) // 空数组作为依赖项，确保只在组件装载时调用一次

  const handleFormSubmit = (reset = false) => {
    if (reset) {
      setDisplayText(undefined)
      reload()
      if (onRedo) {
        onRedo()
      }
    }
    // 将 handleFormSubmit 定义为一个组件内的函数
    const mockEvent = { preventDefault: () => {} } as any
    handleSubmit(mockEvent)
    //console.log('form submit for', text.length)
    setHasFinished(false) // 提交表单后，将 hasFinished 设置为 false
  }

  // 简化逻辑：计算要显示的内容
  const contentToShow =
    displayText === undefined
      ? messages.filter(m => m.role !== 'user').slice(-1)[0]?.content
      : displayText

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="maindisplay">
        <pre style={{ whiteSpace: 'pre-wrap' }} className="m-5">
          {renderContent ? renderContent(contentToShow) : contentToShow}
        </pre>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'none' }}>
        <textarea value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
      {showMenu && (
        <AnimatedPlusMenu onRefresh={handleFormSubmit} onExpand={onExpand} />
      )}
    </div>
  )
}
