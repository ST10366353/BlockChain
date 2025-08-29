"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Download, Copy, X, QrCode, Share2, Loader2 } from 'lucide-react'
import { useToast } from '@/src/hooks/use-toast'

// QR Code data types
export type QRCodeData = {
  type: 'credential' | 'connection' | 'presentation' | 'url' | 'text'
  data: any
  metadata?: {
    title?: string
    description?: string
    timestamp?: string
    expiresAt?: string
  }
}

interface QRCodeGeneratorProps {
  isOpen: boolean
  onClose: () => void
  data: QRCodeData
  title?: string
  size?: number
}

export default function QRCodeGenerator({
  isOpen,
  onClose,
  data,
  title = "QR Code",
  size = 256
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { toastSuccess, toastError } = useToast()

  // Generate QR code using a simple canvas-based approach
  // In production, you'd use a proper QR code library like qrcode.js
  const generateQRCode = async (text: string, canvasSize: number) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasSize
    canvas.height = canvasSize

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Simple QR code pattern (placeholder - in production use proper QR library)
    // This creates a basic pattern for demonstration
    const qrSize = 21 // Standard QR code size
    const moduleSize = Math.floor(canvasSize / (qrSize + 8)) // Add padding
    const offset = Math.floor((canvasSize - qrSize * moduleSize) / 2)

    // Generate simple pattern based on text hash
    const hash = simpleHash(text)
    const pattern = generateQRPattern(qrSize, hash)

    // Draw QR code pattern
    ctx.fillStyle = 'black'
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        if (pattern[y][x]) {
          ctx.fillRect(
            offset + x * moduleSize,
            offset + y * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      }
    }

    // Convert to data URL
    const imageUrl = canvas.toDataURL('image/png')
    setQrImageUrl(imageUrl)
    setIsGenerating(false)
  }

  // Simple hash function for generating QR patterns
  const simpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Generate QR pattern based on hash
  const generateQRPattern = (size: number, hash: number): boolean[][] => {
    const pattern: boolean[][] = []

    for (let y = 0; y < size; y++) {
      pattern[y] = []
      for (let x = 0; x < size; x++) {
        // Use hash to determine pattern
        const bit = (hash >> ((y * size + x) % 32)) & 1
        pattern[y][x] = bit === 1
      }
    }

    // Add finder patterns (position detection)
    // Top-left
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if ((x < 3 || x > 3) && (y < 3 || y > 3)) {
          pattern[y][x] = true
        }
      }
    }

    // Top-right
    for (let y = 0; y < 7; y++) {
      for (let x = size - 7; x < size; x++) {
        if ((x < size - 4 || x > size - 4) && (y < 3 || y > 3)) {
          pattern[y][x] = true
        }
      }
    }

    // Bottom-left
    for (let y = size - 7; y < size; y++) {
      for (let x = 0; x < 7; x++) {
        if ((x < 3 || x > 3) && (y < size - 4 || y > size - 4)) {
          pattern[y][x] = true
        }
      }
    }

    return pattern
  }

  // Prepare data for QR code
  const prepareQRData = (data: QRCodeData): string => {
    const qrPayload = {
      type: data.type,
      data: data.data,
      timestamp: data.metadata?.timestamp || new Date().toISOString(),
      ...(data.metadata && { metadata: data.metadata })
    }

    return JSON.stringify(qrPayload)
  }

  // Initialize QR code generation
  useEffect(() => {
    if (isOpen && data) {
      setIsGenerating(true)
      setError(null)
      setQrImageUrl(null)

      try {
        const qrText = prepareQRData(data)
        generateQRCode(qrText, size)
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Failed to generate QR code')
        setIsGenerating(false)
        toastError('QR Code Error', 'Failed to generate QR code')
      }
    }
  }, [isOpen, data, size, toastError])

  // Download QR code
  const downloadQRCode = () => {
    if (!qrImageUrl) return

    const link = document.createElement('a')
    link.download = `qr-code-${data.type}-${Date.now()}.png`
    link.href = qrImageUrl
    link.click()

    toastSuccess('Download Complete', 'QR code downloaded successfully')
  }

  // Copy QR code to clipboard
  const copyQRCode = async () => {
    if (!qrImageUrl) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      toastSuccess('Copied', 'QR code copied to clipboard')
    } catch (err) {
      console.error('Error copying QR code:', err)
      toastError('Copy Failed', 'Unable to copy QR code to clipboard')
    }
  }

  // Share QR code data
  const shareQRCode = async () => {
    const qrText = prepareQRData(data)

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${data.type} QR Code`,
          text: qrText,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(qrText)
        toastSuccess('Shared', 'QR code data copied to clipboard')
      }
    } catch (err) {
      console.error('Error sharing QR code:', err)
      toastError('Share Failed', 'Unable to share QR code')
    }
  }

  // Get display title based on type
  const getDisplayTitle = () => {
    switch (data.type) {
      case 'credential':
        return data.metadata?.title || 'Credential QR Code'
      case 'connection':
        return data.metadata?.title || 'Connection QR Code'
      case 'presentation':
        return data.metadata?.title || 'Presentation QR Code'
      case 'url':
        return data.metadata?.title || 'URL QR Code'
      default:
        return data.metadata?.title || 'QR Code'
    }
  }

  // Get display description
  const getDisplayDescription = () => {
    return data.metadata?.description || `Scan this QR code to access the ${data.type}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{getDisplayTitle()}</h3>
            <p className="text-sm text-gray-600">{getDisplayDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Generation Error</h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  const qrText = prepareQRData(data)
                  generateQRCode(qrText, size)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : isGenerating ? (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating QR code...</p>
            </div>
          ) : qrImageUrl ? (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <canvas
                    ref={canvasRef}
                    className="block"
                    style={{ width: size, height: size, maxWidth: '100%' }}
                  />
                </div>
              </div>

              {/* QR Code Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <QrCode className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">QR Code Details</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Type:</strong> {data.type}</div>
                  {data.metadata?.expiresAt && (
                    <div><strong>Expires:</strong> {new Date(data.metadata.expiresAt).toLocaleString()}</div>
                  )}
                  <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={copyQRCode}
                  className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  onClick={shareQRCode}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors col-span-2"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Security Note:</strong> Only share this QR code with trusted parties.
                  The data encoded may contain sensitive information.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Hook for generating QR codes
export function useQRCodeGenerator() {
  const [isOpen, setIsOpen] = useState(false)
  const [qrData, setQrData] = useState<QRCodeData | null>(null)

  const generateQRCode = (data: QRCodeData) => {
    setQrData(data)
    setIsOpen(true)
  }

  const closeQRCode = () => {
    setIsOpen(false)
    setQrData(null)
  }

  return {
    isOpen,
    qrData,
    generateQRCode,
    closeQRCode
  }
}

// Utility functions for creating QR code data
export const createCredentialQR = (credentialId: string, title?: string, description?: string): QRCodeData => ({
  type: 'credential',
  data: { credentialId },
  metadata: {
    title: title || 'Credential Share',
    description: description || 'Scan to receive credential',
    timestamp: new Date().toISOString()
  }
})

export const createConnectionQR = (did: string, name?: string, description?: string): QRCodeData => ({
  type: 'connection',
  data: { did, name },
  metadata: {
    title: name || 'Connection Request',
    description: description || 'Scan to establish connection',
    timestamp: new Date().toISOString()
  }
})

export const createPresentationQR = (presentationId: string, title?: string, description?: string): QRCodeData => ({
  type: 'presentation',
  data: { presentationId },
  metadata: {
    title: title || 'Presentation Share',
    description: description || 'Scan to receive presentation',
    timestamp: new Date().toISOString()
  }
})

export const createUrlQR = (url: string, title?: string, description?: string): QRCodeData => ({
  type: 'url',
  data: { url },
  metadata: {
    title: title || 'URL Share',
    description: description || 'Scan to open URL',
    timestamp: new Date().toISOString()
  }
})
