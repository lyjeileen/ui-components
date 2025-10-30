import './chatContainer.css'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { getMessageIdentifier } from '../helper'
import Icon from '../icon/icon'
import MessageArchive from '../messageArchive/messageArchive'
import MessageSpace from '../messageSpace/messageSpace'
import type { ComponentMap, Message, Sender, WebSocketClient } from '../types'

export interface ChatContainerProps {
  /** WebSocket connection - if present, shows MessageSpace; if not, shows MessageArchive */
  ws?: WebSocketClient
  /** Current user */
  sender?: Sender
  /** Main chat messages */
  messages: Message[]
  /** Function to get historic messages for archive mode */
  getHistoricMessages?: () => Promise<Message[]>
  /** Supported message elements */
  supportedElements: ComponentMap
  /** Function to render profile component for each message */
  getProfileComponent: (msg: Message) => JSX.Element
  /** Actions component for messages */
  getActionsComponent?: (msg: Message) => JSX.Element
  /** Thread messages keyed by root message ID */
  threadMessages?: Record<string, Message[]>
  /** User information for displaying thread participants */
  usersInfo?: Record<string, any>
  /** Participants information */
  participants?: any
  /** Info message for archive mode */
  infoMessage?: string
  /** Content to render below MessageSpace */
  belowMessagesContent?: {
    main?: React.ReactNode
    thread?: (activeThreadId?: string) => React.ReactNode
  }
  /** Callback when thread is opened */
  onThreadOpen?: (messageId: string) => void
}

export default function ChatContainer(props: ChatContainerProps) {
  const [activeThreadId, setActiveThreadId] = useState<string>()

  function handleThreadOpen(messageId: string) {
    setActiveThreadId(messageId)
    props.onThreadOpen?.(messageId)
  }

  function handleThreadClose() {
    setActiveThreadId(undefined)
  }

  function getRootMessages(threadId: string): Message[] {
    return props.messages.filter(
      (message) => getMessageIdentifier(message) === threadId
    )
  }

  function getMainActionsComponent(message: Message) {
    const messageId = getMessageIdentifier(message)
    const hasThreadReplies = props.threadMessages?.[messageId]
    const threadLabel = hasThreadReplies ? 'Reply to thread' : 'Start thread'

    return (
      <>
        {props.threadMessages && props.ws && (
          <IconButton
            onClick={() => handleThreadOpen(messageId)}
            size="small"
            aria-label={threadLabel}
          >
            <Icon name="chat_bubble" />
          </IconButton>
        )}
        {props.getActionsComponent?.(message)}
      </>
    )
  }

  const activeThreadMessages = activeThreadId
    ? props.threadMessages?.[activeThreadId] || []
    : undefined
  const rootMessages = activeThreadId
    ? getRootMessages(activeThreadId)
    : undefined

  return (
    <Stack direction="row" className="rustic-chat-container">
      {/* Main Chat Area */}
      <Box
        className={`rustic-main-chat ${activeThreadId ? 'with-thread' : ''}`}
      >
        {props.ws && props.sender ? (
          <>
            <MessageSpace
              ws={props.ws}
              sender={props.sender}
              receivedMessages={props.messages}
              getProfileComponent={props.getProfileComponent}
              supportedElements={props.supportedElements}
              activeThreadId={activeThreadId}
              threadMessages={props.threadMessages}
              onThreadOpen={handleThreadOpen}
              getActionsComponent={getMainActionsComponent}
            />
            {props.belowMessagesContent?.main}
          </>
        ) : (
          <>
            <MessageArchive
              infoMessage={props.infoMessage}
              getHistoricMessages={props.getHistoricMessages!}
              getProfileComponent={props.getProfileComponent}
              supportedElements={props.supportedElements}
              activeThreadId={activeThreadId}
              threadMessages={props.threadMessages}
              onThreadOpen={handleThreadOpen}
              getActionsComponent={getMainActionsComponent}
            />
            {props.belowMessagesContent?.main}
          </>
        )}
      </Box>

      {/* Thread Area */}
      {activeThreadId && rootMessages && rootMessages.length > 0 && (
        <>
          <Box className="rustic-thread-divider">
            <Divider orientation="vertical" />
          </Box>
          <Box className="rustic-thread-chat">
            <Box className="rustic-thread-header">
              <Typography variant="body1Bold">Thread</Typography>
              <IconButton onClick={handleThreadClose} size="small">
                <Icon name="close" />
              </IconButton>
            </Box>
            {props.ws && props.sender ? (
              <>
                <MessageSpace
                  ws={props.ws}
                  sender={props.sender}
                  rootMessages={rootMessages}
                  receivedMessages={activeThreadMessages}
                  getProfileComponent={props.getProfileComponent}
                  supportedElements={props.supportedElements}
                  {...(props.getActionsComponent && {
                    getActionsComponent: props.getActionsComponent,
                  })}
                />
                {props.belowMessagesContent?.thread?.(activeThreadId)}
              </>
            ) : (
              <>
                <MessageArchive
                  getHistoricMessages={() =>
                    Promise.resolve([
                      ...rootMessages,
                      ...(activeThreadMessages || []),
                    ])
                  }
                  getProfileComponent={props.getProfileComponent}
                  supportedElements={props.supportedElements}
                  {...(props.getActionsComponent && {
                    getActionsComponent: props.getActionsComponent,
                  })}
                />
                {props.belowMessagesContent?.thread?.(activeThreadId)}
              </>
            )}
          </Box>
        </>
      )}
    </Stack>
  )
}
