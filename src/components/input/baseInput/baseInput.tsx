import './baseInput.css'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import React from 'react'
import { v4 as getUUID } from 'uuid'

import type { BaseInputProps, Message } from '../../types'

function ErrorMessage(props: { errorMessage: string }) {
  return (
    <Typography
      variant="caption"
      color="error"
      className="rustic-error-message"
      data-cy="error-message"
    >
      {props.errorMessage}
    </Typography>
  )
}

export default function BaseInput(
  props: React.PropsWithChildren<BaseInputProps>
) {
  const [messageText, setMessageText] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isEndingRecording, setIsEndingRecording] = useState(false)
  const [speechToTextError, setSpeechToTextError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isEmptyMessage = !messageText.trim().length
  const isSendDisabled = props.isSendEnabled
    ? !props.isSendEnabled
    : isEmptyMessage

  const speechToTextTooltipTitle = `${isRecording ? 'Stop' : 'Start'} speech to text`
  const speechToTextInactiveColor = isFocused ? 'primary.main' : 'primary.light'
  const speechToTextIconColor = isRecording
    ? 'error.main'
    : speechToTextInactiveColor
  const speechToTextIconName = isRecording ? 'stop_circle' : 'speech_to_text'

  const speechRecognitionErrors = {
    'no-speech':
      'No speech detected. Check your microphone volume and try again.',
    aborted:
      'Speech input was aborted. Ensure no other windows are accessing your microphone and try again.',
    'audio-capture':
      'Could not capture any audio. Check that your microphone is connected and try again.',
    network:
      'Failed to connect to the internet for recognition. Check your internet connection and try again.',
    'not-allowed':
      'This functionality requires microphone access. Please allow microphone access and try again.',
    'service-not-allowed':
      "Speech recognition service is not allowed, either because the browser doesn't support it or because of reasons of security, privacy or user preference.",
    'bad-grammar':
      'There was an error in the speech recognition grammar or format. Check your speech input or grammar rules.',
    'language-not-supported':
      "The language you're speaking isn't supported. Try speaking in a different language or check your device settings.",
  }

  function handleToggleSpeechToText() {
    const microphone = new window.webkitSpeechRecognition()
    const recognitionLang = navigator.language

    microphone.lang = recognitionLang

    if (isRecording) {
      microphone.stop()
      setIsEndingRecording(true)
      setIsRecording(false)
    } else {
      microphone.start()
      setSpeechToTextError('')
      setIsRecording(true)
    }

    microphone.onstart = () => {
      setIsRecording(true)
    }

    microphone.onresult = (event: SpeechRecognitionEvent) => {
      const currentTranscript = event.results[0][0].transcript

      if (messageText.length > 0) {
        setMessageText(messageText + ' ' + currentTranscript)
      } else {
        setMessageText(currentTranscript)
      }

      inputRef.current?.focus()
      setIsRecording(false)
    }

    microphone.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorDescription = speechRecognitionErrors[event.error]

      setSpeechToTextError(errorDescription)
      setIsRecording(false)
    }

    microphone.onend = () => {
      setIsEndingRecording(false)
      setIsRecording(false)
    }
  }

  const speechToTextButtonAdornment = {
    endAdornment: (
      <InputAdornment position="end">
        {isEndingRecording ? (
          <CircularProgress size={24} data-cy="spinner" />
        ) : (
          <Tooltip title={speechToTextTooltipTitle}>
            <IconButton
              data-cy="record-button"
              onClick={handleToggleSpeechToText}
              size="small"
              sx={{ color: speechToTextIconColor }}
            >
              <span className="material-symbols-rounded">
                {speechToTextIconName}
              </span>
            </IconButton>
          </Tooltip>
        )}
      </InputAdornment>
    ),
  }

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
    props.setMultimodalErrorMessages && props.setMultimodalErrorMessages([])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      !isSendDisabled && handleSendMessage()
    }
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setSpeechToTextError('')
    setMessageText(e.target.value)
  }

  return (
    <Box className="rustic-base-input">
      <Box className="rustic-error-and-text-field-container">
        <Box>
          <ErrorMessage errorMessage={speechToTextError} />
          {props.multimodalErrorMessages &&
            props.multimodalErrorMessages.map((errorMessage, index) => (
              <ErrorMessage errorMessage={errorMessage} key={index} />
            ))}
        </Box>
        <TextField
          data-cy="text-field"
          className="rustic-text-field"
          variant="outlined"
          value={messageText}
          label={props.label}
          placeholder={props.placeholder}
          maxRows={props.maxRows}
          multiline={props.multiline}
          fullWidth={props.fullWidth}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          inputRef={inputRef}
          color="secondary"
          size="small"
          error={!!speechToTextError}
          InputProps={
            props.enableSpeechToText ? speechToTextButtonAdornment : {}
          }
        />
      </Box>
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
          <span className="material-symbols-rounded">send</span>
        </IconButton>
      </Box>
    </Box>
  )
}

BaseInput.defaultProps = {
  multiline: true,
  fullWidth: true,
  maxRows: 6,
  enableSpeechToText: false,
}
