import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, CameraOff, Flashlight, FlashlightOff, RotateCcw, Loader2 } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from "@zxing/library";
import { useToast } from "@/components/ui/toast";
import { parseQRCode, validateQRCodeFormat, getQRCodeTypeDescription, generateQRPreview } from "@/lib/qr-parser";
import { logger } from "@/lib/logger";

export function QRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup camera stream and code reader on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use back camera on mobile
      });
      streamRef.current = stream;
      setHasPermission(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      logger.error("Error accessing camera", err);
      setHasPermission(false);
      setError("Camera access denied or unavailable");
    }
  };

  const startScanning = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      if (!hasPermission) {
        await requestCameraPermission();
      }

      if (hasPermission && videoRef.current) {
        setIsScanning(true);
        setScanResult(null);

        // Initialize ZXing code reader
        if (!codeReaderRef.current) {
          codeReaderRef.current = new BrowserMultiFormatReader();
        }

        // Start decoding from video element
        try {
          const result = await codeReaderRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current);

          if (result) {
            const scannedText = result.getText();

            // Validate and parse the QR code
            if (!validateQRCodeFormat(scannedText)) {
              setError('Invalid QR code format');
              showError('Invalid QR code format');
              setIsScanning(false);
              return;
            }

            const parsed = parseQRCode(scannedText);
            setScanResult(scannedText);
            setParsedResult(parsed);

            if (parsed.isValid) {
              success(`QR code scanned successfully! (${getQRCodeTypeDescription(parsed.type)})`);
            } else {
              showError('QR code scanned but format not recognized');
            }

            setIsScanning(false);

            // Stop the video stream after successful scan
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
          }
        } catch (scanError) {
          if (scanError instanceof NotFoundException) {
            // No QR code found, this is normal - continue scanning
            logger.debug('No QR code detected, continuing to scan...');
            // Don't set error for NotFoundException - it's expected
          } else if (scanError instanceof ChecksumException) {
            setError('QR code appears to be corrupted or damaged');
            showError('QR code appears to be corrupted or damaged. Try scanning again.');
            setIsScanning(false);
          } else if (scanError instanceof FormatException) {
            setError('Invalid QR code format - not a supported type');
            showError('This QR code format is not supported. Please scan a valid credential or DID code.');
            setIsScanning(false);
          } else if (scanError instanceof Error) {
            // Handle other specific error types
            if (scanError.message.includes('permission')) {
              setError('Camera permission denied');
              showError('Camera access denied. Please allow camera permissions and try again.');
            } else if (scanError.message.includes('not found')) {
              setError('Camera not found');
              showError('No camera found. Please connect a camera and try again.');
            } else {
              logger.error('Scan error', scanError);
              setError(`Scan failed: ${scanError.message}`);
              showError('Failed to scan QR code. Please try again.');
            }
            setIsScanning(false);
          } else {
            logger.error('Unknown scan error', scanError);
            setError('An unknown error occurred while scanning');
            showError('An unexpected error occurred. Please try again.');
            setIsScanning(false);
          }
        }
      }
    } catch (err) {
      logger.error('Error starting scan', err);

      // More specific error handling for camera issues
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
          setError('Camera permission denied');
          setHasPermission(false);
          showError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
        } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
          setError('No camera found');
          showError('No camera detected. Please connect a camera and refresh the page.');
        } else if (err.name === 'NotReadableError' || err.message.includes('busy')) {
          setError('Camera is busy');
          showError('Camera is being used by another application. Please close other apps and try again.');
        } else if (err.name === 'OverconstrainedError' || err.message.includes('constraint')) {
          setError('Camera constraints not supported');
          showError('Your camera does not support the required settings. Try using a different camera.');
        } else {
          setError('Failed to start camera');
          showError(`Failed to start camera: ${err.message}`);
        }
      } else {
        setError('Failed to start camera');
        showError('An unexpected error occurred while starting the camera.');
      }

      setIsScanning(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanResult(null);
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;

      const capabilities = track.getCapabilities() as any;
      if (!capabilities.torch) {
        showError('Flash/torch not supported on this device');
        return;
      }

      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any]
      });

      setFlashEnabled(!flashEnabled);
      success(flashEnabled ? 'Flash turned off' : 'Flash turned on');
    } catch (error) {
      logger.error('Failed to toggle flash', { error: error instanceof Error ? error.message : error });
      showError('Failed to control camera flash');
    }
  };

  const resetScanner = () => {
    stopScanning();
    setScanResult(null);
    setParsedResult(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan QR codes to import credential data or access shared credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative">
          <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {hasPermission === null ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Camera not initialized</p>
                  <Button
                    onClick={requestCameraPermission}
                    className="mt-3"
                  >
                    Enable Camera
                  </Button>
                </div>
              </div>
            ) : hasPermission === false ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 mb-2">Camera access denied</p>
                  <p className="text-sm text-gray-600">
                    Please enable camera permissions and try again
                  </p>
                  <Button
                    onClick={requestCameraPermission}
                    variant="outline"
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Corner brackets */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-indigo-500"></div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-indigo-500"></div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-indigo-500"></div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-indigo-500"></div>

                      {/* Scanning line animation */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-0.5 bg-indigo-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanning Status */}
                {isScanning && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-center">
                      <p className="text-sm">Scanning for QR codes...</p>
                      <p className="text-xs opacity-75">Position QR code within the frame</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          {hasPermission && (
            <div className="mt-3 flex justify-center space-x-2">
              {isInitializing ? (
                <Button disabled className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </Button>
              ) : !isScanning ? (
                <Button onClick={startScanning} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline">
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              )}

              <Button onClick={toggleFlash} variant="outline" size="sm">
                {flashEnabled ? (
                  <FlashlightOff className="w-4 h-4" />
                ) : (
                  <Flashlight className="w-4 h-4" />
                )}
              </Button>

              <Button onClick={resetScanner} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Scan Result */}
        {scanResult && parsedResult && (
          <div className={`p-4 border rounded-lg ${
            parsedResult.isValid
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start space-x-3">
              <QrCode className={`w-5 h-5 mt-0.5 ${
                parsedResult.isValid ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <p className={`font-medium mb-1 ${
                  parsedResult.isValid ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {parsedResult.isValid ? 'QR Code Scanned Successfully!' : 'QR Code Scanned (Unknown Format)'}
                </p>

                <div className="space-y-2 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type: </span>
                    <span className="text-sm text-gray-800">
                      {getQRCodeTypeDescription(parsedResult.type)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">Data: </span>
                    <span className="text-sm font-mono text-gray-800 break-all">
                      {generateQRPreview(scanResult, 60)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {parsedResult.type === 'credential' && parsedResult.data.shareCode && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Import Credential
                    </Button>
                  )}
                  {parsedResult.type === 'did' && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      View Profile
                    </Button>
                  )}
                  {parsedResult.type === 'url' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Open Link
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(scanResult)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetScanner}
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CameraOff className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Camera Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center py-4 text-gray-600">
          <p className="text-sm mb-2">Supported QR code formats:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-100 rounded">Credential IDs</span>
            <span className="px-2 py-1 bg-gray-100 rounded">DID URLs</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Share Links</span>
            <span className="px-2 py-1 bg-gray-100 rounded">JSON Data</span>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <QrCode className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Scanning Tips</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure good lighting for better detection</li>
                <li>• Hold device steady and keep QR code centered</li>
                <li>• QR codes should be at least 2x2 inches for best results</li>
                <li>• Distance from camera: 6-12 inches</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
