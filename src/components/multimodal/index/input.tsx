import './input.css'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import React from 'react'

import BaseInput from '../../textInput'
import type { FileInfo, InputProps, Message } from '../../types'
import FilePreview from '../filePreview/filePreview'
import Uploader from '../uploader'

export default function Input(props: InputProps) {
  const [addedFiles, setAddedFiles] = useState<FileInfo[]>([])
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [pendingUploadCount, setPendingUploadCount] = useState(0)
  const hasUploadedFiles = addedFiles.length > 0 && pendingUploadCount === 0

  function handleSendMessage(formattedMessage: Message): void {
    if (hasUploadedFiles) {
      formattedMessage.data = {
        file_count: addedFiles.length,
      }
    }
    props.ws.send(formattedMessage)
    setAddedFiles([])
  }

  function handleDelete(id: string, fileController: AbortController) {
    setErrorMessages([])
    setAddedFiles((prev) => prev.filter((file) => file.id !== id))
    setPendingUploadCount((prev) => (prev === 0 ? prev : prev - 1))
    fileController.abort()
    props.onFileDelete(id)
  }

  const isSendButtonDisabled =
    addedFiles.length === 0 || pendingUploadCount !== 0
  return (
    <Box className="rustic-input-container">
      {errorMessages.map((errorMessage, index) => (
        <Typography
          variant="caption"
          color="error"
          className="rustic-error-message"
          key={index}
          data-cy="error-message"
        >
          {errorMessage}
        </Typography>
      ))}
      <BaseInput
        {...props}
        send={handleSendMessage}
        isSendEnabled={!isSendButtonDisabled}
      >
        <Box sx={{ flex: '1 1 auto' }}>
          <Box className="rustic-files" sx={{ border: '1px solid #ccc' }}>
            {addedFiles.length > 0 &&
              addedFiles.map((file, index) => (
                <FilePreview
                  key={index}
                  name={file.name}
                  onDelete={() => handleDelete(file.id, file.abortController)}
                  loadingProgress={file.loadingProgress}
                />
              ))}
          </Box>
          <Box className="rustic-bottom-buttons">
            <Uploader
              setAddedFiles={setAddedFiles}
              onFileAdd={props.onFileAdd}
              addedFiles={addedFiles}
              acceptedFileTypes={props.acceptedFileTypes}
              setErrorMessages={setErrorMessages}
              setPendingUploadCount={setPendingUploadCount}
              maxFileSize={props.maxFileSize}
              maxFileCount={props.maxFileCount}
            />
          </Box>
        </Box>
      </BaseInput>
    </Box>
  )
}

Input.defaultProps = {
  multiline: true,
  fullWidth: true,
  maxRows: 6,
}
