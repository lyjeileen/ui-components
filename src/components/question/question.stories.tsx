import type { Meta, StoryFn } from '@storybook/react'
import React, { useState } from 'react'

import MessageCanvas from '../messageCanvas/messageCanvas'
import Text from '../text/text'
import type { Message } from '../types'
import Question from './question'

const meta: Meta<React.ComponentProps<typeof Question>> = {
  title: 'Rustic UI/Question/Question',
  component: Question,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story: StoryFn) => {
      return (
        <div style={{ maxWidth: '400px' }}>
          <Story />
        </div>
      )
    },
  ],
}

meta.argTypes = {
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

export default meta

const options = ['Yes', 'Maybe', 'No']

export const Default = {
  args: {
    currentUser: 'You',
    conversationId: '1',
    messageId: '1',
    title: 'What do you think?',
    description: 'Choose either of the options below.',
    options,
  },
}

export const InMessageSpace = {
  decorators: [
    (Story: StoryFn) => {
      const [selectedOption, setSelectedOption] = useState('')

      return (
        <div style={{ maxWidth: '400px' }}>
          <MessageCanvas
            message={{
              id: '1',
              sender: 'Agent',
              timestamp: new Date().toISOString(),
              conversationId: '1',
              format: 'question',
              data: {},
            }}
          >
            <Story
              args={{
                ...Default.args,
                ws: {
                  send: (selection: Message) =>
                    setSelectedOption(selection.data.text),
                },
              }}
            />
          </MessageCanvas>
          {selectedOption.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <MessageCanvas
                message={{
                  id: '2',
                  sender: 'You',
                  timestamp: new Date().toISOString(),
                  conversationId: '1',
                  format: 'text',
                  data: {
                    text: selectedOption,
                  },
                }}
              >
                <Text text={selectedOption} />
              </MessageCanvas>
            </div>
          )}
        </div>
      )
    },
  ],
}
