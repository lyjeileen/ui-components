import 'cypress-real-events'

import { v4 as getUUID } from 'uuid'

import {
  botUser,
  supportedViewports,
  testUser,
} from '../../../cypress/support/variables'
import { MarkedMarkdown, type Message, Text } from '..'
import Icon from '../icon/icon'
import ChatContainer from './chatContainer'

describe('ChatContainer Component', () => {
  const supportedElements = {
    TextFormat: Text,
    MarkdownFormat: MarkedMarkdown,
  }

  const conversationId = '1'

  const agentMessageData = {
    sender: botUser,
    conversationId,
  }

  const humanMessageData = {
    sender: testUser,
    conversationId,
  }

  const message1Id = 'message-1'
  const message2Id = 'message-2'

  const mainMessages = [
    {
      ...humanMessageData,
      id: message1Id,
      timestamp: '2024-01-02T00:00:00.000Z',
      format: 'TextFormat',
      data: {
        text: 'First message with threads',
      },
    },
    {
      ...agentMessageData,
      id: message2Id,
      timestamp: '2024-01-02T00:13:00.000Z',
      format: 'TextFormat',
      data: {
        text: 'Second message with thread',
      },
    },
  ]

  const threadMessages = {
    [message1Id]: [
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:02:00.000Z',
        format: 'TextFormat',
        data: {
          text: 'Thread reply 1',
        },
      },
      {
        ...agentMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:03:00.000Z',
        format: 'TextFormat',
        data: {
          text: 'Thread reply 2',
        },
      },
    ],
    [message2Id]: [
      {
        ...humanMessageData,
        id: getUUID(),
        timestamp: '2024-01-02T00:14:00.000Z',
        format: 'TextFormat',
        data: {
          text: 'Single thread reply',
        },
      },
    ],
  }

  const getProfileComponent = (message: Message) => {
    if (message.sender.name?.includes('Agent')) {
      return <Icon name="smart_toy" />
    } else {
      return <Icon name="account_circle" />
    }
  }

  supportedViewports.forEach((viewport) => {
    it(`renders main chat area correctly on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
        />
      )

      cy.get('.rustic-chat-container').should('exist')
      cy.get('.rustic-main-chat').should('exist')
      cy.get('[data-cy=message-space]').should('contain', 'First message')
      cy.get('[data-cy=message-space]').should('contain', 'Second message')
    })

    it(`opens thread area when start thread button is clicked on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          threadMessages={threadMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
        />
      )

      // Thread area should not be visible initially
      cy.get('.rustic-thread-chat').should('not.exist')

      // Click the start thread button (chat_bubble icon) on the first message
      cy.get('[data-cy="chat_bubble-icon"]').first().click()

      // Thread area should now be visible
      cy.get('.rustic-thread-chat').should('exist')
      cy.get('.rustic-thread-header').should('contain', 'Thread')

      // Thread should contain the root message and thread replies
      cy.get('.rustic-thread-chat').should('contain', 'First message')
      cy.get('.rustic-thread-chat').should('contain', 'Thread reply 1')
      cy.get('.rustic-thread-chat').should('contain', 'Thread reply 2')
    })

    it.only(`opens thread area when thread reply count is clicked on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          threadMessages={threadMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
        />
      )

      // Thread area should not be visible initially
      cy.get('.rustic-thread-chat').should('not.exist')

      // Click the thread reply count on the first message
      cy.get('.rustic-thread-reply-count').first().click()

      // Thread area should now be visible
      cy.get('.rustic-thread-chat').should('exist')
      cy.get('.rustic-thread-header').should('contain', 'Thread')

      // Thread should contain the root message and thread replies
      cy.get('.rustic-thread-chat').should('contain', 'First message')
      cy.get('.rustic-thread-chat').should('contain', 'Thread reply 1')
      cy.get('.rustic-thread-chat').should('contain', 'Thread reply 2')
    })

    it(`closes thread area when close button is clicked on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          threadMessages={threadMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
        />
      )

      // Open thread
      cy.get('[data-cy="chat_bubble-icon"]').first().click()
      cy.get('.rustic-thread-chat').should('exist')

      // Close thread
      cy.get('.rustic-thread-header').find('button').click()
      cy.get('.rustic-thread-chat').should('not.exist')
    })

    it(`calls onThreadOpen callback when thread is opened on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }
      const onThreadOpen = cy.stub()

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          threadMessages={threadMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
          onThreadOpen={onThreadOpen}
        />
      )

      cy.get('[data-cy="chat_bubble-icon"]').first().click()
      cy.wrap(onThreadOpen).should('be.calledWith', message1Id)
    })

    it(`renders MessageArchive when no ws is provided on ${viewport} screen`, () => {
      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          messages={mainMessages}
          getHistoricMessages={() => Promise.resolve(mainMessages)}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
        />
      )

      cy.get('.rustic-chat-container').should('exist')
      cy.get('[data-cy=message-archive]').should('exist')
    })

    it(`renders custom below messages content on ${viewport} screen`, () => {
      const mockWsClient = {
        send: cy.stub(),
        close: cy.stub(),
        reconnect: cy.stub(),
      }

      cy.viewport(viewport)
      cy.mount(
        <ChatContainer
          ws={mockWsClient}
          sender={testUser}
          messages={mainMessages}
          supportedElements={supportedElements}
          getProfileComponent={getProfileComponent}
          belowMessagesContent={{
            main: <div data-cy="custom-main-content">Custom Main Content</div>,
            thread: (threadId) => (
              <div data-cy="custom-thread-content">
                Thread Content for {threadId}
              </div>
            ),
          }}
        />
      )

      // Check main content
      cy.get('[data-cy=custom-main-content]').should(
        'contain',
        'Custom Main Content'
      )

      // Open thread and check thread content
      cy.get('[data-cy="chat_bubble-icon"]').first().click()
      cy.get('[data-cy=custom-thread-content]').should(
        'contain',
        `Thread Content for ${message1Id}`
      )
    })
  })
})
