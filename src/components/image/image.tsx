/* eslint-disable no-magic-numbers, @typescript-eslint/no-unused-vars */
import './image.css'
import '../../index.css'

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import React from 'react'

import { getSizeStyles } from '../helper'
import MarkedMarkdown from '../markdown/markedMarkdown'
import type { ImageProps } from '../types'

/** The `Image` component facilitates the display of images, providing loading indication and error handling capabilities. It supports customization of image dimensions and alternative text, ensuring accessibility and a seamless user experience. Supported image formats: jpeg, png, gif, svg, webp, AVIF, APNG. */
export default function Image({
  alt = 'An image is displayed',
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [imageSrc, setImageSrc] = useState<string>(props.src)

  // Load image with authentication when getAuthHeaders is available
  useEffect(() => {
    if (!props.getAuthHeaders) {
      // If no auth headers needed, use the original source
      setImageSrc(props.src)
      return
    }

    // Set loading state while fetching
    setIsLoading(true)

    // Function to convert ArrayBuffer to base64
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      const uInt8Array = new Uint8Array(buffer)
      const chunks: string[] = []
      const chunkSize = 8192 // Process in chunks to avoid call stack limit

      for (let i = 0; i < uInt8Array.length; i += chunkSize) {
        const chunk = uInt8Array.slice(i, i + chunkSize)
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)))
      }

      return btoa(chunks.join(''))
    }

    // Function to detect MIME type from binary data
    const detectMimeType = (buffer: ArrayBuffer): string => {
      const arr = new Uint8Array(buffer).subarray(0, 4)
      const header = Array.from(arr)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Check file signature (magic numbers)
      if (header.startsWith('89504e47')) {
        return 'image/png'
      }
      if (header.startsWith('ffd8ff')) {
        return 'image/jpeg'
      }
      if (header.startsWith('47494638')) {
        return 'image/gif'
      }
      if (
        header.startsWith('52494646') &&
        new Uint8Array(buffer)
          .subarray(8, 12)
          .reduce((a, c, i) => a + String.fromCharCode(c), '') === 'WEBP'
      ) {
        return 'image/webp'
      }

      return 'image/jpeg' // Default fallback
    }

    // Fetch image with authentication using modern Fetch API
    props
      .getAuthHeaders()
      .then((authData) => {
        return fetch(props.src, {
          method: 'GET',
          headers: {
            Authorization: authData.headers.Authorization,
          },
        })
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`)
        }
        return response.arrayBuffer()
      })
      .then((buffer) => {
        // Convert array buffer to base64
        const base64 = arrayBufferToBase64(buffer)

        // Detect MIME type from the buffer
        const mimeType = detectMimeType(buffer)

        // Create data URL
        const dataUrl = `data:${mimeType};base64,${base64}`

        // Set as image source
        setImageSrc(dataUrl)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching image:', error)
        handleImageError()
      })
  }, [props.src, props.getAuthHeaders])

  function handleImageError(): void {
    setErrorMessage('Image failed to load')
    setIsLoading(false)
  }

  if (errorMessage.length > 0) {
    return <Typography variant="body2">{errorMessage}</Typography>
  }

  return (
    <figure>
      {isLoading && <CircularProgress data-cy="spinner" />}
      {props.title && <Typography variant="h6">{props.title}</Typography>}
      <img
        {...getSizeStyles(props.width, props.height)}
        src={imageSrc}
        alt={alt}
        onError={handleImageError}
        onLoad={() => {
          setIsLoading(false)
        }}
      />
      {props.description && (
        <figcaption>
          <MarkedMarkdown text={props.description} />
        </figcaption>
      )}
    </figure>
  )
}
