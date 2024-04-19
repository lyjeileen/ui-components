/* eslint-disable no-console */
import '../textInput/textInput.css'

import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import React from 'react'
import { v4 as getUUID } from 'uuid'

import type { BaseInputProps, Message } from '../types'

export default function BaseInput(
  props: React.PropsWithChildren<BaseInputProps>
) {
  const [messageText, setMessageText] = useState<string>('')
  const isEmptyMessage = !messageText.trim().length
  const isSendDisabled = !props.isSendEnabled
    ? !props.isSendEnabled
    : isEmptyMessage

  function handleSendMessage(): void {
    const currentTime = new Date().toISOString()
    const formattedMessage: Message = {
      id: getUUID(),
      timestamp: currentTime,
      sender: props.sender,
      conversationId: props.conversationId,
      format: 'text',
      data: { text: messageText },
    }

    props.send(formattedMessage)
    setMessageText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      !isSendDisabled && handleSendMessage()
    }
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setMessageText(e.target.value)
  }

  return (
    <Box className="rustic-text-input-container">
      <TextField
        data-cy="text-input"
        className="rustic-text-input"
        variant="outlined"
        value={messageText}
        label={props.label}
        placeholder={props.placeholder}
        maxRows={props.maxRows}
        multiline={props.multiline}
        fullWidth={props.fullWidth}
        onKeyDown={handleKeyDown}
        onChange={handleOnChange}
        color="secondary"
        size="small"
      />
      <Box className="rustic-input-actions">
        {props.children}
        <IconButton
          data-cy="send-button"
          aria-label="send message"
          onClick={handleSendMessage}
          disabled={isSendDisabled}
          color="primary"
          className="rustic-send-button"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

BaseInput.defaultProps = {
  multiline: true,
  fullWidth: true,
  maxRows: 6,
}
