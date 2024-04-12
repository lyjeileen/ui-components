import './input.css'

import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import React from 'react'
import { v4 as getUUID } from 'uuid'

import FilePreview from '../filePreview/filePreview'
import type { TextInput } from '../textInput/textInput'
import type { Message } from '../types'
import Uploader from './uploader'

export interface Input extends TextInput {
  acceptedFileTypes?: string
  onFileAdd: (file: File) => Promise<{ url: string }>
  onFileDelete: (fileId: string) => Promise<{ isDeleted: boolean }>
}

export interface FileInfo {
  id: string
  url?: string
  name: string
  loadingProgress: number
}

export default function Input(props: Input) {
  const [messageText, setMessageText] = useState<string>('')
  const [addedFiles, setAddedFiles] = useState<FileInfo[]>([])
  const isEmptyMessage = !messageText.trim().length

  function handleSendMessage(): void {
    if (!isEmptyMessage || addedFiles.length > 0) {
      const currentTime = new Date().toISOString()

      const formattedMessage: Message = {
        id: getUUID(),
        timestamp: currentTime,
        sender: props.sender,
        format: 'text',
        conversationId: props.conversationId,
        data: {},
      }

      if (addedFiles.length > 0) {
        const files = addedFiles.map((file) => {
          return { name: file.name, url: file.url }
        })
        formattedMessage.format = 'files'
        formattedMessage.data = {
          description: messageText,
          files: files,
        }
      } else {
        formattedMessage.data = {
          text: messageText,
        }
      }
      props.ws.send(formattedMessage)
      setMessageText('')
      setAddedFiles([])
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setMessageText(e.target.value)
  }

  return (
    <Box className="rustic-input-container">
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
        InputProps={{
          endAdornment: (
            <Box className="rustic-files">
              {addedFiles.length > 0 &&
                addedFiles.map((file, index) => (
                  <FilePreview
                    key={index}
                    id={file.id}
                    name={file.name}
                    onFileDelete={props.onFileDelete}
                    setAddedFiles={setAddedFiles}
                  />
                ))}
            </Box>
          ),
        }}
      />
      <Box className="rustic-bottom-buttons">
        <Uploader
          setAddedFiles={setAddedFiles}
          onFileAdd={props.onFileAdd}
          addedFiles={addedFiles}
          acceptedFileTypes={props.acceptedFileTypes}
        />
        <IconButton
          data-cy="send-button"
          aria-label="send message"
          onClick={handleSendMessage}
          disabled={isEmptyMessage && addedFiles.length === 0}
          color="primary"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

Input.defaultProps = {
  multiline: true,
  fullWidth: true,
  maxRows: 6,
}
