/* eslint-disable no-magic-numbers */
import 'cypress-real-events'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'

import { isMobile } from '../../../cypress/support/helper'
import MessageCanvas from './messageCanvas'

describe('MessageCanvas', () => {
  const testMessage = {
    id: '1',
    timestamp: '2020-01-02T00:00:00.000Z',
    sender: 'senderId',
    conversationId: 'lkd9vc',
    topicId: 'default',
    format: 'text',
    data: { text: 'Hello World' },
  }

  const testMessageUpdate = {
    ...testMessage,
    lastThreadMessage: {
      id: '3',
      timestamp: '2020-01-02T00:00:00.000Z',
      sender: 'senderId',
      conversationId: 'lkd9vc',
      topicId: 'default',
      threadId: '2',
      format: 'text',
      data: { text: '!' },
    },
  }

  it('renders the component', () => {
    cy.mount(
      <MessageCanvas
        message={testMessage}
        getProfileComponent={() => {
          return <AccountCircleIcon />
        }}
      >
        <p>Hello World</p>
      </MessageCanvas>
    )

    cy.contains('Hello World').should('be.visible')
    cy.contains('senderId').should('be.visible')
    cy.get('[data-testid="AccountCircleIcon"]').should('be.visible')
  })

  it('shows timestamp on touch on mobile and on hover on desktop', () => {
    cy.mount(
      <MessageCanvas message={testMessage}>
        <p>Hello World</p>
      </MessageCanvas>
    )
    cy.contains('Jan 1 2020').should('not.be.visible')

    if (isMobile()) {
      cy.get('.rustic-message-canvas').realTouch()
    } else {
      cy.get('.rustic-message-canvas').realHover()
    }

    cy.contains('Jan 1 2020').should('be.visible')
  })

  it('shows that it was last updated on mobile if an update is provided', () => {
    cy.mount(
      <MessageCanvas message={testMessageUpdate}>
        <p>Hello World</p>
      </MessageCanvas>
    )

    if (isMobile()) {
      cy.get('.rustic-message-canvas').realTouch()
    } else {
      cy.get('.rustic-message-canvas').realHover()
    }

    cy.contains('last updated').should('be.visible')
  })
})
