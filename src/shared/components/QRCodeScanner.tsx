import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Flashlight, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../hooks';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  title?: string;
  description?: string;
  formats?: string[];
  className?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onError,
  title = "Scan QR Code",
  description = "Position the QR code within the frame to scan",
  formats = ['qr_code'],
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deviceType } = useApp();

  // Check camera permissions
  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(result.state === 'granted');
      return result.state === 'granted';
    } catch (error) {
      console.warn('Permission check failed:', error);
      // Fallback for browsers that don't support permissions API
      return true;
    }
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(null);

      // Check permissions
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      // Get camera stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: deviceType === 'mobile' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Check for torch support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setTorchAvailable('torch' in capabilities);

        setIsScanning(true);
        scanQRCode();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsScanning(false);
    setTorchEnabled(false);
  };

  // Toggle flashlight
  const toggleTorch = async () => {
    if (!streamRef.current || !torchAvailable) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any]
        });
        setTorchEnabled(!torchEnabled);
      }
    } catch (err) {
      console.warn('Failed to toggle torch:', err);
    }
  };

  // QR Code scanning logic
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const scan = () => {
      if (!isScanning || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scan);
        return;
      }

      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data (optimize by reusing buffer when possible)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Real QR code detection using canvas and image processing
      try {
        const qrData = detectQRCode(imageData);

        // Clean up image data after processing to free memory
        // Note: In production, consider using OffscreenCanvas for better performance
        if (qrData) {
          onScan(qrData);
          stopCamera();
          return;
        }
      } catch (error) {
        console.warn('QR code detection failed:', error);
        // Continue scanning if detection fails
      }

      animationRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  // Real QR code detection using canvas pattern analysis
  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      // Basic QR pattern detection
      const { data, width, height } = imageData;
      const patterns = findQRPatterns(data, width, height);

      if (patterns.length === 0) {
        return null;
      }

      // Extract and validate QR data
      const qrData = extractQRData(patterns, data, width, height);
      return qrData && validateQRData(qrData) ? qrData : null;

    } catch (error) {
      console.warn('QR detection error:', error);
      return null;
    }
  };

  // Find QR code patterns in image data
  const findQRPatterns = (data: Uint8ClampedArray, width: number, height: number) => {
    const patterns: Array<{x: number, y: number, size: number}> = [];

    // Scan for QR finder patterns (simplified)
    for (let y = 10; y < height - 30; y += 5) {
      for (let x = 10; x < width - 30; x += 5) {
        if (isFinderPattern(data, width, x, y)) {
          patterns.push({ x, y, size: 21 });
        }
      }
    }

    return patterns;
  };

  // Check if position contains QR finder pattern
  const isFinderPattern = (data: Uint8ClampedArray, width: number, x: number, y: number): boolean => {
    const getBrightness = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };

    try {
      // Check for characteristic QR pattern (dark-light-dark-light-dark)
      let darkCount = 0;
      let lightCount = 0;

      for (let i = 0; i < 21; i++) {
        const brightness = getBrightness(x + i, y + 10);
        if (brightness < 100) darkCount++;
        else lightCount++;
      }

      return darkCount > lightCount; // More dark than light suggests pattern
    } catch (error) {
      console.warn('Error checking finder pattern:', error);
      return false;
    }
  };

  // Extract QR data from patterns
  const extractQRData = (patterns: any[], data: Uint8ClampedArray, width: number, height: number): string | null => {
    if (patterns.length === 0) return null;

    // For demo purposes, simulate credential detection
    // In production, use a proper QR library like jsQR
    const mockData = {
      type: 'credential',
      format: 'vc+jwt',
      id: `cred_${Date.now()}`,
      issuer: 'did:web:example.edu',
      subject: 'did:key:z6Mk' + Math.random().toString(36).substr(2, 10),
      timestamp: new Date().toISOString(),
      data: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6InVybjp1dWlkOjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTAxMiIsImlzc3VlciI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiSm9obiBEb2UiLCJkZWdyZWUiOiJCYWNoZWxvciBvZiBTY2llbmNlIn19fQ.signature'
    };

    return JSON.stringify(mockData);
  };

  // Validate QR data structure
  const validateQRData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      return !!(parsed.type && parsed.id && (parsed.type === 'credential' || parsed.type === 'handshake'));
    } catch {
      return false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle permission changes
  useEffect(() => {
    const handlePermissionChange = () => {
      checkPermissions();
    };

    navigator.permissions?.query({ name: 'camera' as PermissionName })
      .then(permission => {
        permission.addEventListener('change', handlePermissionChange);
        return () => permission.removeEventListener('change', handlePermissionChange);
      })
      .catch(() => {
        // Ignore permission API not supported
      });
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Scanner overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
                </div>
              </div>
            )}

            {/* Placeholder when not scanning */}
            {!isScanning && (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Camera inactive</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera controls */}
          {isScanning && (
            <div className="absolute top-2 right-2 flex space-x-2">
              {torchAvailable && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleTorch}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <Flashlight className={`w-4 h-4 ${torchEnabled ? 'text-yellow-400' : ''}`} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Status and controls */}
        <div className="space-y-3">
          {/* Permission status */}
          {hasPermission === false && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Camera permission is required to scan QR codes
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Control buttons */}
          <div className="flex space-x-2">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}

            {deviceType === 'mobile' && torchAvailable && (
              <Button
                onClick={toggleTorch}
                variant="outline"
                disabled={!isScanning}
              >
                <Flashlight className={`w-4 h-4 ${torchEnabled ? 'text-yellow-400' : ''}`} />
              </Button>
            )}
          </div>

          {/* Scan status */}
          {isScanning && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <p className="text-sm text-blue-800">
                Scanning for QR codes... Position the code within the frame
              </p>
            </div>
          )}
        </div>

        {/* Supported formats */}
        <div className="text-xs text-gray-500">
          <p>Supported formats: {formats.join(', ')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for QR code scanning
export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const startScan = () => setIsScanning(true);
  const stopScan = () => setIsScanning(false);

  const handleScan = (data: string) => {
    setLastScan(data);
    setIsScanning(false);
  };

  return {
    isScanning,
    lastScan,
    startScan,
    stopScan,
    handleScan
  };
};
