'use client';

import './chatAnyContext.css';

import { Button, Flex, Input, Select, useToast } from '@chakra-ui/react';
import { useChat } from 'ai/react';
import { useState } from 'react';

const selectOptions = [
  { value: 'docs0', label: '当前文档', note: '当前文档的全文' },
  { value: 'docs1', label: '密切相关文档', note: '前后5天内相同标题的文档' },
  {
    value: 'docs2',
    label: '松散相关文档',
    note: '前后5天内相同发件人和收件人的文档',
  },
  { value: 'batch0', label: '当前批次', note: '当前批次的所有文档' },
  { value: 'batch1', label: '当前项目', note: '当前项目的所有文档' },
  { value: 'batch2', label: '所有项目', note: '所有项目的所有批次' },
];

// 增加 props 类型定义
interface ChatAnyContextProps {
  docId: string; // 将 text 设为可选参数
  batchId?: number;
  projId?: string;
  cat?: string;
}

// 修改组件定义，以接收新的参数
export default function ChatAnyContext({
  docId,
  batchId,
  projId,
  cat = 'doc',
}: ChatAnyContextProps) {
  const toast = useToast();
  const [score, setScore] = useState(7); // 初始化分数状态为0

  const [chatCategory, setChatCategory] = useState({
    id: docId,
    cat,
    docId,
    batchId,
    projId,
    score,
  }); // 初始化状态

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: chatCategory, // 使用状态作为参数
  });

  // 修改handleSelectChange函数，添加toast提醒
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCat = event.target.value;
    console.log('selected: ', selectedCat);
    setChatCategory({
      cat: selectedCat,
      id: docId,
      docId,
      batchId,
      projId,
      score,
    }); // 根据选择更新状态
    // 添加toast提醒
    toast({
      title: '功能开发中',
      description: '此功能尚未实现，请稍后再试。',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  // 修改handleScoreChange函数，添加toast提醒
  const handleScoreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedScore = parseInt(event.target.value, 10); // 从事件中获取选中的分数并转换为数字
    setScore(selectedScore); // 更新分数状态
    // 添加toast提醒
    toast({
      title: '功能开发中',
      description: '此功能尚未实现，请稍后再试。',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <div className="chat-container">
      <ul>
        {messages.map((m) => (
          <li
            key={m.id || `${m.role}-${Date.now()}-${Math.random()}`}
            className={`message ${m.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {m.content}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <Flex direction="column" mt="4">
          <Flex>
            <Select
              mt={2}
              mr="2"
              placeholder="选择对话的范围"
              w="auto"
              minWidth="160px"
              onChange={handleSelectChange}
              value={chatCategory.cat}
            >
              {selectOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                  title={option.note}
                >
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              mt={2}
              placeholder="分数"
              w="80px"
              onChange={handleScoreChange}
              value={score}
            >
              {Array.from({ length: 11 }, (_, i) => (
                <option value={i} key={i}>
                  {i}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex mt="2">
            <Input
              placeholder="Say something..."
              value={input}
              onChange={handleInputChange}
              mr="2"
              flex="1"
            />
            <Button
              colorScheme="blue"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              对话
            </Button>
          </Flex>
        </Flex>
      </form>
    </div>
  );
}
