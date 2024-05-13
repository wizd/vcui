'use client'

import { useChat } from 'ai/react'

export default function ChatAnywhere() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      <ul>
        {messages.map((m, index) => (
          <li key={index}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <label>
          <input
            placeholder="Say something..."
            style={{ width: '80ch' }}
            value={input}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">对话</button>
      </form>
    </div>
  )
}
