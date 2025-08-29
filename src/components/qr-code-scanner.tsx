"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, X, RotateCcw, Flashlight, FlashlightOff, Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/src/hooks/use-toast'

// QR Code scanning result types
export type QRScanResult = {
  type: 'credential' | 'connection' | 'presentation' | 'url' | 'text'
  data: any
  rawData: string
}

// QR Code scanner props
interface QRCodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: QRScanResult) => void
  title?: string
  description?: string
  expectedTypes?: ('credential' | 'connection' | 'presentation' | 'url' | 'text')[]
}

export default function QRCodeScanner({
  isOpen,
  onClose,
  onScan,
  title = "Scan QR Code",
  description = "Point your camera at a QR code to scan it",
  expectedTypes = ['credential', 'connection', 'presentation', 'url']
}: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const { toastError } = useToast()

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported on this device')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Check for flash support
        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities() as any
        setHasFlash(capabilities.torch || false)
      }

      setIsLoading(false)
      setIsScanning(true)

    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      setIsLoading(false)
      toastError('Camera Error', 'Unable to access camera. Please check permissions.')
    }
  }, [facingMode, toastError])

  // Switch camera
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  // Toggle flash
  const toggleFlash = async () => {
    if (!streamRef.current) return

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      const capabilities = videoTrack.getCapabilities() as any

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        })
        setFlashOn(!flashOn)
      }
    } catch (err) {
      console.error('Error toggling flash:', err)
    }
  }

  // Parse QR code data
  const parseQRData = (data: string): QRScanResult => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data)

      if (parsed.type && parsed.data) {
        return {
          type: parsed.type,
          data: parsed.data,
          rawData: data
        }
      }
    } catch {
      // Not JSON, try to detect type from content
    }

    // Check for DID format
    if (data.startsWith('did:')) {
      return {
        type: 'connection',
        data: { did: data },
        rawData: data
      }
    }

    // Check for URL format
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return {
        type: 'url',
        data: { url: data },
        rawData: data
      }
    }

    // Check for credential-like content
    if (data.includes('credential') || data.includes('verifiable') || data.includes('@context')) {
      try {
        const credential = JSON.parse(data)
        return {
          type: 'credential',
          data: credential,
          rawData: data
        }
      } catch {
        // Not a valid credential
      }
    }

    // Default to text
    return {
      type: 'text',
      data: { text: data },
      rawData: data
    }
  }

  // Process QR code detection
  const processQRCode = useCallback((qrData: string) => {
    try {
      const result = parseQRData(qrData)

      // Validate expected types
      if (expectedTypes.length > 0 && !expectedTypes.includes(result.type)) {
        toastError('Invalid QR Code', `Expected ${expectedTypes.join(', ')} but got ${result.type}`)
        return
      }

      setIsScanning(false)
      onScan(result)

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

    } catch (err) {
      console.error('Error processing QR code:', err)
      toastError('QR Code Error', 'Unable to process the scanned QR code')
    }
  }, [expectedTypes, onScan, toastError])

  // QR Code detection using canvas
  const detectQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Simple QR code detection (in a real implementation, you'd use a library like jsQR)
    // For now, we'll simulate QR detection
    // This is a placeholder - in production, use a proper QR detection library

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(detectQRCode)
  }, [isScanning])

  // Start/stop scanning
  useEffect(() => {
    if (isOpen && !isLoading && !error) {
      animationFrameRef.current = requestAnimationFrame(detectQRCode)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isOpen, isLoading, error, detectQRCode])

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCamera()
    } else {
      // Cleanup when closing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setIsScanning(false)
      setError(null)
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isOpen, initializeCamera])

  // Manual QR code input for testing (remove in production)
  const handleManualInput = () => {
    const testData = prompt('Enter QR code data for testing:')
    if (testData) {
      processQRCode(testData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Camera Error</h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={initializeCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Initializing camera...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera view */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                    <div className="absolute inset-4 border border-blue-300 rounded">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-blue-400 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={switchCamera}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
                  title="Switch camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {hasFlash && (
                  <button
                    onClick={toggleFlash}
                    className={`p-3 rounded-full ${flashOn ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={flashOn ? 'Turn off flash' : 'Turn on flash'}
                  >
                    {flashOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
                  </button>
                )}

                <button
                  onClick={initializeCamera}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
                  title="Refresh camera"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isScanning ? 'Scanning for QR codes...' : 'Camera ready'}
                </p>
              </div>

              {/* Expected types info */}
              {expectedTypes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Looking for:</strong> {expectedTypes.join(', ')}
                  </p>
                </div>
              )}

              {/* Manual input for testing */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleManualInput}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Manual Input (Dev Only)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
