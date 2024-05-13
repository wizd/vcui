'use client'
import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import ChatWithTask from './chatWithTask'

const ChatRank = ({
  text,
  prompt,
  promptName,
  renderContent,
  onExpand,
  onScored
}: {
  text: string
  prompt: string
  promptName: string
  renderContent?: (content: string) => JSX.Element
  onExpand?: () => void
  onScored?: (score: number, reason: string) => void
}) => {
  //console.log('in chatRank, prompt is: ', prompt)
  //console.log('in chatRank, text is: ', text)
  const [score, setScore] = useState<number | undefined>(undefined)

  const parseScore = (output: string) => {
    const cleanedOutput = output
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
    try {
      const obj = JSON.parse(cleanedOutput)
      setScore(obj.score)
      onScored?.(obj.score, obj.reason)
      return obj.reason
    } catch (e) {
      console.error('Failed to parse score:', e, ' for json: ', output)
      setScore(undefined)
      return output
    }
  }

  return (
    <VStack align="start" spacing={4}>
      {/* <HStack spacing={4}>
        <Box width="80px" bg="blue.500" color="white" borderRadius="md">
          <Text fontSize="36px" fontWeight="bold" textAlign="center">
            {score ?? '?'}
          </Text>
        </Box>
        <Text fontWeight="bold" fontSize="lg">
          {promptName}
        </Text>
      </HStack> */}
      <Box flex="1" width="full">
        <ChatWithTask
          prompt={prompt}
          text={text}
          showMenu={false}
          onFinish={parseScore}
          onRedo={() => setScore(undefined)}
          renderContent={renderContent}
          onExpand={onExpand}
        />
      </Box>
    </VStack>
  )
}

export default ChatRank
