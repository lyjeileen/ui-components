import Typography from '@mui/material/Typography'
import useTheme from '@mui/system/useTheme'
import React from 'react'

import { ElementRenderer, type ThreadableMessage } from '..'
import Text from '../text/text'
import CopyText from './actions/copy/copyText'
import MessageCanvas from './messageCanvas'

export default {
  title: 'Rustic UI/Message Canvas/Message Canvas',
  component: MessageCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

const mockWsClient = {
  send: () => {},
  close: () => {},
  reconnect: () => {},
}

const commonElementRendererProps = {
  ws: mockWsClient,
  sender: { name: 'You', id: '16usbj' },
  conversationId: '1',
}

const baseMessage = {
  id: '1',
  timestamp: '2020-01-02T00:00:00.000Z',
  conversationId: 'lkd9vc',
  topic: 'default',
  format: 'text',
  data: {
    text: 'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.',
  },
}

const messageFromAgent = {
  ...baseMessage,
  sender: { name: 'Scheduling agent', id: 'bh1hbjkidjn' },
}

const messageFromHuman = {
  ...baseMessage,
  sender: { name: 'Some sender', id: '1562ajosn' },
}

const messageString = JSON.stringify({
  ...baseMessage,
  sender: messageFromAgent.sender,
})

const elementRendererString = `<ElementRenderer
      message={messageFromAgent}
      supportedElements={{ text: Text }}
    />`

const profileString = `(message: ThreadableMessage) => {
    <>
      {getProfileIcon(message)}
      <Typography variant="body1" color="text.secondary">
        {message.sender.name}
      </Typography>
    </>
  }`

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

function getProfileName(message: ThreadableMessage) {
  return (
    <Typography variant="body1" color="text.secondary">
      {message.sender.name}
    </Typography>
  )
}

function getProfileIconAndName(message: ThreadableMessage) {
  return (
    <>
      {getProfileIcon(message)}
      {getProfileName(message)}
    </>
  )
}

export const WithProfileIcon = {
  args: {
    children: (
      <ElementRenderer
        message={messageFromHuman}
        supportedElements={{ text: Text }}
        {...commonElementRendererProps}
      />
    ),
    message: messageFromHuman,
    getProfileComponent: getProfileIconAndName,
  },
  parameters: {
    docs: {
      source: {
        code: `<MessageCanvas
  getProfileComponent={${profileString}}
  message={${messageString}}
  >
    ${elementRendererString}
</MessageCanvas>`,
      },
    },
  },
}

export const NoIcon = {
  args: {
    children: (
      <ElementRenderer
        message={messageFromAgent}
        supportedElements={{ text: Text }}
        {...commonElementRendererProps}
      />
    ),
    getProfileComponent: getProfileName,
    message: messageFromAgent,
  },
  parameters: {
    docs: {
      source: {
        code: `<MessageCanvas
  message={${messageString}}
  getProfileComponent={${profileString}}
  >
    ${elementRendererString}
</MessageCanvas>`,
      },
    },
  },
}

export const WithCopyIcon = {
  args: {
    children: (
      <ElementRenderer
        message={messageFromHuman}
        supportedElements={{ text: Text }}
        {...commonElementRendererProps}
      />
    ),
    message: messageFromHuman,
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
  parameters: {
    docs: {
      source: {
        code: `<MessageCanvas
  getProfileComponent={${profileString}}
  getActionsComponent={(message: ThreadableMessage) => {
    const copyButton = message.format === 'text' && <CopyText message={message} />
    if (copyButton) {
      return <>{copyButton}</>
    }
  }}
  message={${messageString}}
  >
    ${elementRendererString}
</MessageCanvas>`,
      },
    },
  },
}
