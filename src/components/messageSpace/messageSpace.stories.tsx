import Typography from '@mui/material/Typography'
import useTheme from '@mui/system/useTheme'
import type { Meta } from '@storybook/react'
import type { StoryFn } from '@storybook/react'
import React from 'react'
import { v4 as getUUID } from 'uuid'

import {
  FCCalendar,
  Image,
  MarkedMarkdown,
  MarkedStreamingMarkdown,
  Multipart,
  OpenLayersMap,
  RechartsTimeSeries,
  Sound,
  StreamingText,
  Table,
  Text,
  type ThreadableMessage,
  Video,
  YoutubeVideo,
} from '..'
import CodeSnippet from '../codeSnippet/codeSnippet'
import CopyText from '../messageCanvas/actions/copy/copyText'
import MessageSpace from './messageSpace'

const meta: Meta<React.ComponentProps<typeof MessageSpace>> = {
  title: 'Rustic UI/Message Space/Message Space',
  component: MessageSpace,
  tags: ['autodocs'],
  decorators: [
    (Story: StoryFn) => {
      return (
        <div style={{ height: '500px' }}>
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    layout: 'centered',
  },
}

export default meta

function getProfileIcon(message: ThreadableMessage) {
  const theme = useTheme()
  const sharedAvatarStyle = {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '50%',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.divider,
    padding: '3px',
    fontSize: '16px',
  }
  if (message.sender.name?.includes('Agent')) {
    return (
      <span className="material-symbols-rounded" style={sharedAvatarStyle}>
        smart_toy
      </span>
    )
  } else {
    return (
      <span className="material-symbols-rounded" style={sharedAvatarStyle}>
        person
      </span>
    )
  }
}

function getProfileIconAndName(message: ThreadableMessage) {
  return (
    <>
      {getProfileIcon(message)}
      <Typography variant="body1" color="text.secondary">
        {message.sender.name}
      </Typography>
    </>
  )
}

meta.argTypes = {
  messages: {
    table: {
      type: {
        summary: 'Array of ThreadableMessage.\n',
        detail:
          'ThreadableMessage extends the Message interface which has the following fields:\n' +
          '  id: A string representing the unique identifier of the message.\n' +
          '  timestamp: A string representing the timestamp of the message.\n' +
          '  sender: An object representing the sender of the message.\n' +
          '  conversationId: A string representing the identifier of the conversation to which the message belongs.\n' +
          '  format: A string representing the format of the message.\n' +
          '  data: An object of type MessageData, which can contain any key-value pairs.\n' +
          '  inReplyTo: An optional string representing the identifier of the message to which this message is a reply.\n' +
          '  threadId: An optional string representing the identifier of the thread to which this message belongs.\n' +
          '  priority: An optional string representing the priority of the message.\n' +
          '  taggedParticipants: An optional array of strings representing the participants tagged in the message.\n' +
          '  topic: An optional string representing the identifier of the topic associated with the message.\n' +
          'Other than the fields described above, ThreadableMessage also has the following fields:\n' +
          '  lastThreadMessage: An optional object of Message interface representing the last message in the thread.\n' +
          '  threadMessagesData: An optional array of objects of type MessageData, which can contain any key-value pairs.',
      },
    },
  },
  ws: {
    table: {
      type: {
        summary: 'WebSocketClient',
        detail:
          'send: (message: Message) => void\nclose: () => void\nreconnect: () => void\n',
      },
    },
  },
}
const conversationId = '1'

const agentMessageData = {
  sender: { name: 'Some Agent', id: '187w981' },
  conversationId,
}

const humanMessageData = {
  sender: { name: 'Some User', id: '16817ywb' },
  conversationId,
}

const timeSeriesData = [
  {
    timestamp: 1704096000000,
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    timestamp: 1704182400000,
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    timestamp: 1704268800000,
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    timestamp: 1704355200000,
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    timestamp: 1704441600000,
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
]

const code = `function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('JavaScript');`
const tableData = [
  {
    food: 'chocolate milk',
    calories: 219,
    carbs: 27.31,
    protein: 8.37,
    fat: 8.95,
  },
  {
    food: 'whole milk',
    calories: 165,
    carbs: 11.99,
    protein: 8.46,
    fat: 9.44,
  },
  {
    food: '2% skimmed milk',
    calories: 129,
    carbs: 12.38,
    protein: 8.51,
    fat: 5.1,
  },
  {
    food: '1% skimmed milk',
    calories: 108,
    carbs: 12.87,
    protein: 8.69,
    fat: 2.5,
  },
  {
    food: 'skim milk',
    calories: 88,
    carbs: 12.84,
    protein: 8.72,
    fat: 0.21,
  },
]

const chartColors = ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000']

export const Default = {
  args: {
    ws: { send: () => {} },
    sender: humanMessageData.sender,
    messages: [
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:00:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the markdown component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:01:00.000Z',
        format: 'markdown',
        data: {
          text: '# Title\n\n---\n\n ## Subtitle\n\nThis is a paragraph. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n- This is an **inline notation**\n- This is a *inline notation*.\n- This is a _inline notation_.\n- This is a __inline notation__.\n- This is a ~~inline notation~~.\n\n```\nconst string = "Hello World"\nconst number = 123\n```\n\n> This is a blockquote.\n\n1. Item 1\n2. Item 2\n3. Item 3\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Item 1   | Item 2   | Item 3   |',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:02:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the time series component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:03:00.000Z',
        format: 'timeSeries',
        data: {
          title: 'Demo Time Series Chart',
          timeSeries: timeSeriesData,
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          yAxisLabelWidth: 60,
          chartColors,
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:04:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the calendar component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:05:00.000Z',
        format: 'calendar',
        data: {
          events: [
            {
              id: '1',
              start: '2024-02-07T10:00:00',
              end: '2024-02-07T12:00:00',
              title: 'Aquarium',
            },
            {
              id: '2',
              start: '2024-02-07T12:00:00',
              end: '2024-02-07T14:00:00',
              title: 'Lunch',
            },
            {
              id: '3',
              start: '2024-02-08T09:00:00',
              title: 'Niagra Falls',
            },
            {
              id: '4',
              start: '2024-02-09T14:00:00',
              end: '2024-02-09T16:00:00',
              title: 'Casa Loma',
            },
            {
              id: '5',
              start: '2024-02-09T10:30:00',
              end: '2024-02-09T12:30:00',
              title: 'Royal Ontario Museum',
            },
          ],
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:06:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the table component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:07:00.000Z',
        format: 'table',
        data: {
          title: 'Nutrient Data Comparison Across Various Types of Milk',
          description:
            'This table illustrates the variations in calories and nutrients for different types of milk, with measurements based on a serving size of 250 ml. Caloric values are expressed in kCal, and nutrient quantities are measured in grams. The data is sourced from the Canadian Nutrient File.',
          data: tableData,
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:08:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the video component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:09:00.000Z',
        format: 'youtubeVideo',
        data: {
          height: '300px',
          width: '100%',
          youtubeVideoId: 'MtN1YnoL46Q',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:10:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the image component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:11:00.000Z',
        format: 'image',
        data: {
          src: 'images/image-component-example.png',
          alt: 'A curved facade covered in white latticework',
          description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam vulputate sit non non tincidunt pellentesque varius euismod est. Lobortis feugiat euismod lorem viverra. Ipsum justo pellentesque.',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:12:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the map component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:13:00.000Z',
        format: 'map',
        data: {
          longitude: -123.1115,
          latitude: 49.2856,
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:14:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the code snippet component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:15:00.000Z',
        format: 'codeSnippet',
        data: {
          code: code,
          language: 'javascript',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:16:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the sound component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:17:00.000Z',
        format: 'sound',
        data: {
          src: 'audioExamples/audioStorybook.mp3',
          title: 'Sound Title',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:18:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the video component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:19:00.000Z',
        format: 'video',
        data: {
          src: 'videoExamples/videoStorybook.mp4',
          title: 'Video Title',
        },
      },
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:20:00.000Z',
        format: 'text',
        data: {
          text: 'Could you show me an example of the multipart component?',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:21:00.000Z',
        format: 'multipart',
        data: {
          text: 'Here is an example of the multipart component:',
          files: [{ name: 'imageExample.png' }, { name: 'pdfExample.pdf' }],
        },
      },
    ],
    supportedElements: {
      text: Text,
      streamingText: StreamingText,
      markdown: MarkedMarkdown,
      streamingMarkdown: MarkedStreamingMarkdown,
      image: Image,
      timeSeries: RechartsTimeSeries,
      map: OpenLayersMap,
      youtubeVideo: YoutubeVideo,
      table: Table,
      calendar: FCCalendar,
      codeSnippet: CodeSnippet,
      sound: Sound,
      video: Video,
      multipart: Multipart,
    },
    getProfileComponent: getProfileIconAndName,
    getActionsComponent: (message: ThreadableMessage) => {
      const copyButton = message.format === 'text' && (
        <CopyText message={message} />
      )
      if (copyButton) {
        return <>{copyButton}</>
      }
    },
  },
}
