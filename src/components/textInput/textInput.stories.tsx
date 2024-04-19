import type { Message } from '../types'
import TextInput from './textInput'

export default {
  title: 'Rustic UI/Text Input/Text Input',
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    ws: {
      description:
        'WebSocket connection to send and receive messages to and from a backend. \n<pre>```interface WebSocketClient {\n  send: (message: Message) => void\n  close: () => void\n  reconnect: () => void\n}```</pre>',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The `TextInput` component enables users to input text messages and send them over a WebSocket connection. It provides functionality for sending messages with a sender name, timestamp, and conversation ID.',
      },
    },
  },
}

export const Default = {
  args: {
    sender: 'You',
    conversationId: '1',
    placeholder: 'Type your message',
    ws: {
      send: (message: Message) => alert(`Message sent: ${message.data.text}`),
    },
  },
}

export const NoMultiLine = {
  args: {
    ...Default.args,
    multiline: false,
  },
}

export const CustomizedMaxRows = {
  args: {
    ...Default.args,
    maxRows: 2,
  },
}

export const WithLabel = {
  args: {
    ...Default.args,
    label: 'Custom Label',
  },
}
