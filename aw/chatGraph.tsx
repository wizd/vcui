import React from 'react'
import ChatWithTask from './chatWithTask'
import { Box, Text } from '@chakra-ui/react'
import {
  extractInfoPrompt,
  getFullInfoExtractionPrompt
} from '@/vcshare/tools/jsonInferenceClient'
import CytoscapeComponent from 'react-cytoscapejs'
import { json2neo4j } from '@/actions/mailActions'

const stylesheet: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#61bffc',
      label: 'data(label)',
      'border-color': 'black',
      'border-width': 2,
      'text-valign': 'center',
      color: '#fff',
      'text-outline-color': '#888',
      'text-outline-width': 2,
      shape: 'ellipse'
    }
  },
  {
    selector: '.person',
    style: {
      'background-color': '#f99'
    }
  },
  {
    selector: '.place',
    style: {
      'background-color': '#9f9'
    }
  },
  {
    selector: '.event',
    style: {
      'background-color': '#99f'
    }
  }
]

type Element = {
  data: { id: string; label: string; source?: string; target?: string }
  classes?: string
}

// 定义 ChatGraphProps 类型
type ChatGraphProps = {
  databaseName: string
  fullText: string
  docId: string
  docTitle: string
}

const ChatGraph = ({
  databaseName,
  fullText,
  docId,
  docTitle
}: ChatGraphProps) => {
  const [elements, setElements] = React.useState<Element[]>([])
  const [extractedJson, setExtractedJson] = React.useState<string | undefined>(
    undefined
  )
  const cyRef = React.useRef<cytoscape.Core | null>(null)

  React.useEffect(() => {
    if (extractedJson) {
      // 假设这是从 ChatWithTask 获取到的数据后的处理逻辑
      try {
        processData(extractedJson)
      } catch (error) {
        console.log('error processData', error)
      }
    }
  }, [extractedJson])

  const processData = (content: string) => {
    const cleanedOutput = content
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')

    const data = JSON.parse(cleanedOutput)

    json2neo4j(databaseName, docId, docTitle, cleanedOutput)

    const newElements: {
      data: { id: string; label: string; source?: string; target?: string }
      classes?: string
    }[] = []

    // 添加“当前文档”节点
    newElements.push({
      data: { id: docId, label: docTitle }
    })

    // 为人物、地点和事件创建节点，并将它们与“当前文档”节点连接
    data.people?.forEach((person: string, index: number) => {
      newElements.push({
        data: { id: person, label: person },
        classes: 'person'
      })
      // 连接人物到“当前文档”，并添加id和label
      newElements.push({
        data: {
          id: `person-doc-${index}`,
          label: '邮件提取',
          source: person,
          target: docId
        }
      })
    })
    data.places?.forEach((place: string, index: number) => {
      newElements.push({ data: { id: place, label: place }, classes: 'place' })
      // 连接地点到“当前文档”，并添加id和label
      newElements.push({
        data: {
          id: `place-doc-${index}`,
          label: '邮件提取',
          source: place,
          target: docId
        }
      })
    })
    data.events?.forEach((event: string, index: number) => {
      newElements.push({ data: { id: event, label: event }, classes: 'event' })
      // 连接事件到“当前文档”，并添加id和label
      newElements.push({
        data: {
          id: `event-doc-${index}`,
          label: '邮件提取',
          source: event,
          target: docId
        }
      })
    })

    setElements(newElements)
    if (cyRef.current) {
      setTimeout(() => {
        try {
          const layout = cyRef.current?.layout({ name: 'concentric' })
          layout?.run()
        } catch (error) {
          console.log('error layout', error)
        }
      }, 500) // 延迟100毫秒执行布局
    }
  }

  return (
    <Box
      id="graph"
      border="2px"
      borderColor="teal.500"
      borderRadius="md"
      p={4}
      className="m-5"
    >
      <CytoscapeComponent
        elements={elements}
        style={{ minWidth: '600px', minHeight: '600px' }}
        layout={{ name: 'circle' }}
        stylesheet={stylesheet}
        cy={cy => {
          cyRef.current = cy
        }}
      />

      <div
        style={{
          fontSize: 'lg',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}
      >
        <ChatWithTask
          prompt={getFullInfoExtractionPrompt()}
          text={fullText}
          onFinish={msg => {
            if (extractedJson === undefined) {
              setExtractedJson(msg)
            }
            return ''
          }}
        />
      </div>
    </Box>
  )
}

export default ChatGraph
