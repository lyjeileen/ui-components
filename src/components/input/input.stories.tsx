import type { StoryFn } from '@storybook/react'
import React from 'react'

import Input, { type FileInfo } from './input'
import {
  delayReject,
  getRandomDelayInSeconds,
  onFileAddSuccess,
  onFileDelete,
} from './mockFunctions'

function onFileAddFailed(
  file: File,
  fileId: string,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
  fileInfo: FileInfo
): Promise<{ url: string }> {
  const deplayTimeInSeconds = 5
  return delayReject(
    getRandomDelayInSeconds(deplayTimeInSeconds),
    fileInfo.controller.signal
  )
}

function onFileAddRandom(
  file: File,
  fileId: string,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
  fileInfo: FileInfo
): Promise<{ url: string }> {
  const fiftyPercent = 0.5
  const shouldReject = Math.random() < fiftyPercent

  if (shouldReject) {
    return onFileAddSuccess(file, fileId, onUploadProgress, fileInfo)
  } else {
    return onFileAddFailed(file, fileId, onUploadProgress, fileInfo)
  }
}

export default {
  title: 'Rustic UI/Input/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The `Input` component is a versatile form element that facilitates various types of user input. In addition to supporting text input, it empowers users to upload files seamlessly and efficiently. Designed to be flexible and adaptable, the Input component serves as a foundation for accommodating diverse input requirements.',
      },
    },
  },
  decorators: [
    (Story: StoryFn) => {
      return (
        <div style={{ width: '600px' }}>
          <Story />
        </div>
      )
    },
  ],
}

export const Default = {
  args: {
    sender: 'You',
    conversationId: '1',
    placeholder: 'Type your message',
    ws: {
      // eslint-disable-next-line no-console
      send: (message: any) => console.log('Message sent:', message),
    },
    onFileAdd: onFileAddSuccess,
    onFileDelete,
  },
}

export const PDFAndImageOnly = {
  args: {
    ...Default.args,
    acceptedFileTypes: 'image/*,.pdf',
  },
}

export const FailToUpload = {
  args: {
    sender: 'You',
    conversationId: '1',
    placeholder: 'Type your message',
    ws: {
      // eslint-disable-next-line no-console
      send: (message: any) => console.log('Message sent:', message),
    },
    onFileAdd: onFileAddFailed,
    onFileDelete,
  },
}

export const RandomUploadResult = {
  args: {
    sender: 'You',
    conversationId: '1',
    placeholder: 'Type your message',
    ws: {
      // eslint-disable-next-line no-console
      send: (message: any) => console.log('Message sent:', message),
    },
    onFileAdd: onFileAddRandom,
    onFileDelete,
  },
}

export const SmallFilesOnly = {
  args: {
    ...Default.args,
    maxFileSize: 1048576,
  },
}

export const AllowUploadThreeFilesMax = {
  args: {
    ...Default.args,
    maxFileCount: 3,
  },
}