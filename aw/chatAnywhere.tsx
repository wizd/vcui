'use client';

import { useChat } from 'ai/react';

export default function ChatAnywhere(props: { apiBase?: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: props.apiBase,
  });

  return (
    <div>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          id="message"
          name="message"
          placeholder="Say something..."
          style={{ width: '80ch' }}
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit">对话</button>
      </form>
    </div>
  );
}
