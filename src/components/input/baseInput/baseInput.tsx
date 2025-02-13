import './baseInput.css'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Placeholder from '@tiptap/extension-placeholder'
import type { Editor } from '@tiptap/react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Database } from 'emoji-picker-element'
import type { Emoji as EmojiInfo } from 'emoji-picker-element/shared'
import { RichTextContent, RichTextEditorProvider } from 'mui-tiptap'
import { type ForwardedRef, forwardRef, useRef, useState } from 'react'
import React from 'react'
import { Markdown } from 'tiptap-markdown'
import { v4 as getUUID } from 'uuid'

import { toChatRequest } from '../../helper'
import Icon from '../../icon/icon'
import type { BaseInputProps, Message } from '../../types'
import Emoji from '../emoji/emoji'

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

function showEmojiInfo(emoji: EmojiInfo) {
  if ('unicode' in emoji && 'annotation' in emoji) {
    return `${emoji.unicode} ${emoji.annotation}`
  }
}

/**
 * The `TextInput` component enables users to input text messages and send them over a WebSocket connection. It provides functionality for sending messages with a sender, timestamp, and conversation ID. The component integrates with the [emoji-picker-element](https://www.npmjs.com/package/emoji-picker-element) library to allow users to easily add emojis to their messages. The emoji picker can be customized through CSS variables. For detailed customization options, refer to the [emoji-picker-element documentation](https://www.npmjs.com/package/emoji-picker-element#css-variables).
 *
 * `emoji-picker-element`, `emoji-picker-element-data` and `uuid` are not bundled, so please install the following packages using npm:
 *
 * ```typescript
 * npm i emoji-picker-element emoji-picker-element-data uuid
 * ```
 *
 */
function BaseInputElement(
  props: React.PropsWithChildren<BaseInputProps>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [messageText, setMessageText] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isEndingRecording, setIsEndingRecording] = useState(false)
  const [speechToTextError, setSpeechToTextError] = useState<string>('')
  const [emojiSearchResults, setEmojiSearchResults] = useState<EmojiInfo[]>([])
  const [isEmojiMenuShown, setIsEmojiMenuShown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const database = new Database({ dataSource: props.emojiDataSource })
  const isEmptyMessage = !messageText.trim().length
  const isSendDisabled = isEmptyMessage && !props.isSendEnabled

  const speechToTextTooltipTitle = `${isRecording ? 'Stop' : 'Start'} speech to text`
  const featureButtonColor = isFocused ? 'primary.main' : 'primary.light'
  const speechToTextIconColor = isRecording ? 'error.main' : featureButtonColor
  const speechToTextIconName = isRecording ? 'stop_circle' : 'speech_to_text'
  function handleEmojiClick(
    emoji: string,
    shouldEmojiShortcodeBeReplaced: boolean = false
  ) {
    const shortcodeRegex = /:(\w*)$/
    editor
      ?.chain()
      .focus()
      .command(({ tr, state }) => {
        const { selection } = state
        const { $from } = selection
        if (shouldEmojiShortcodeBeReplaced) {
          // Get the text before the cursor
          const textBeforeCursor = $from.nodeBefore?.text || ''
          const match = textBeforeCursor.match(shortcodeRegex)

          if (match) {
            const start = $from.pos - match[0].length
            const end = $from.pos

            // Replace the matched shortcode with the emoji
            tr.insertText(emoji, start, end)
          }
        } else {
          tr.insertText(emoji)
        }
        //command function needs to return a boolean
        return true
      })
      .run()

    setIsEmojiMenuShown(false)
  }
  function searchEmojis(query: string) {
    database
      .getEmojiBySearchQuery(query)
      .then((results) => {
        if (results.length) {
          setEmojiSearchResults(
            results.slice(0, props.maximumEmojiSearchResults)
          )
          setIsEmojiMenuShown(true)
        } else {
          setEmojiSearchResults([])
          setIsEmojiMenuShown(false)
        }
      })
      .catch(() => {
        setEmojiSearchResults([])
        setIsEmojiMenuShown(false)
      })
  }

  const speechToTextButtonAdornment = isEndingRecording ? (
    <CircularProgress size={24} data-cy="spinner" />
  ) : (
    <Tooltip title={speechToTextTooltipTitle}>
      <IconButton
        data-cy="record-button"
        onClick={handleToggleSpeechToText}
        size="small"
        sx={{
          color: speechToTextIconColor,
          '&:hover': { color: 'primary.main' },
        }}
      >
        <Icon name={speechToTextIconName} />
      </IconButton>
    </Tooltip>
  )

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

  function handleSendMessage(): void {
    const currentTime = new Date().toISOString()
    const formattedMessage: Message = {
      id: getUUID(),
      timestamp: currentTime,
      sender: props.sender,
      conversationId: props.conversationId,
      format: 'ChatCompletionRequest',
      data: toChatRequest(messageText),
    }

    props.send(formattedMessage)
    setMessageText('')
    setSpeechToTextError('')
  }

  function handleOnChange({ editor }: { editor: Editor }): void {
    setSpeechToTextError('')
    const newText = editor.storage.markdown.getMarkdown()
    setMessageText(newText)
    // expression to match ':text:' format
    const closedShortcode = newText.match(/:(\w{2,}):/g)
    // expression to match ':something' format
    const unclosedShortcode = newText.match(/:(\w{2,})/g)

    if (closedShortcode) {
      const shortcode = closedShortcode[0].replace(/:/g, '')
      database
        .getEmojiByShortcode(shortcode)
        .then((emoji) => {
          if (emoji && 'unicode' in emoji) {
            const replacedText = newText.replace(
              closedShortcode[0],
              emoji.unicode
            )
            editor.commands.setContent(replacedText)
            setMessageText(replacedText)
          } else {
            setMessageText(newText)
          }
        })
        .catch(() => {
          setMessageText(newText)
        })
      setIsEmojiMenuShown(false)
    } else if (unclosedShortcode) {
      const query = unclosedShortcode[0].replace(':', '')
      searchEmojis(query)
    } else {
      setIsEmojiMenuShown(false)
    }
  }

  function preventNewLine(editor: Editor, maxRows: number) {
    const content = editor.getHTML()
    const brCount = (content?.match(/<br\s*\/?>/g) || []).length
    return brCount >= maxRows - 1
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    onUpdate: handleOnChange,
    onFocus: () => {
      setIsFocused(true)
    },
    onBlur: () => {
      setIsFocused(false)
    },
    editorProps: {
      handleKeyDown(view, event) {
        // Return true can prevent adding <br> to the input
        if (event.key === 'Enter') {
          if (event.shiftKey) {
            if (props.multiline) {
              if (props.maxRows && editor) {
                preventNewLine(editor, props.maxRows)
              }
            } else {
              return true
            }
          } else {
            if (isEmojiMenuShown && emojiSearchResults.length > 0) {
              // Select the first emoji
              const firstEmoji = emojiSearchResults[0]
              if ('unicode' in firstEmoji) {
                handleEmojiClick(firstEmoji.unicode, true)
              }
            } else if (!isSendDisabled) {
              handleSendMessage()
            }
            return true
          }
        }
      },
    },
  })

  return (
    <Box className="rustic-base-input" ref={ref} data-cy="base-input">
      <Box className={props.fullWidth ? 'ds-full-width' : ''}>
        <Box className="rustic-error-container">
          <Typography
            variant="caption"
            color="error"
            className="rustic-error-message"
            data-cy="error-message"
          >
            {speechToTextError}
          </Typography>
        </Box>
        <Box
          className="rustic-input-field"
          sx={{
            border: '1px solid',
            borderColor: isFocused ? 'secondary.main' : 'action.disabled',
          }}
        >
          {emojiSearchResults.length > 0 && (
            <Popover
              open={isEmojiMenuShown}
              anchorEl={inputRef.current}
              onClose={() => setIsEmojiMenuShown(false)}
              disableAutoFocus={true}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <MenuList data-cy="emoji-menu">
                {emojiSearchResults.map(
                  (emoji, index) =>
                    'unicode' in emoji && (
                      <MenuItem
                        key={index}
                        onClick={() => handleEmojiClick(emoji.unicode, true)}
                      >
                        {showEmojiInfo(emoji)}
                      </MenuItem>
                    )
                )}
              </MenuList>
            </Popover>
          )}
          {/* todo: label props */}
          <RichTextEditorProvider editor={editor}>
            {/* to be improved. Popover menu should follow cursor */}
            <div data-cy="text-field" ref={inputRef}>
              <RichTextContent className="rustic-text-field" />
            </div>
            <div className="rustic-input-extras"></div>

            <Box
              sx={{
                display: 'flex',
                padding: '8px 16px 16px',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {props.children}
              <Emoji
                dataSource={props.emojiDataSource}
                onEmojiClick={handleEmojiClick}
                buttonColor={featureButtonColor}
              />
              {props.enableSpeechToText && speechToTextButtonAdornment}
              <Tooltip title="Send">
                <span className="rustic-send-button">
                  <IconButton
                    data-cy="send-button"
                    aria-label="send message"
                    onClick={handleSendMessage}
                    disabled={isSendDisabled}
                    color="secondary"
                  >
                    <Icon name="send" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </RichTextEditorProvider>
        </Box>
      </Box>
    </Box>
  )
}

const BaseInput = forwardRef(BaseInputElement)

BaseInput.defaultProps = {
  multiline: true,
  fullWidth: true,
  maxRows: 6,
  enableSpeechToText: false,
  maximumEmojiSearchResults: 5,
}

export default BaseInput
