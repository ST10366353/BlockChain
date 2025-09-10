import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Copy, Share2, Eye, EyeOff, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/components/ui/toast";
import { getCurrentUrl } from "@/lib/utils/navigation";
import { logger } from "@/lib/logger";

interface QRCodeGeneratorProps {
  data?: string;
  size?: number;
  title?: string;
}

export function QRCodeGenerator({
  data = "",
  size = 200,
  title = "QR Code"
}: QRCodeGeneratorProps) {
  const [qrData, setQrData] = useState(data);
  const [showData, setShowData] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const { success, error: showError } = useToast();

  // Generate QR code when data changes
  useEffect(() => {
    if (qrData) {
      generateQRCode(qrData);
    } else {
      setQrCodeUrl("");
    }
  }, [qrData]);

  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      setQrCodeUrl("");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // Generate QR code as data URL
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(url);
    } catch (err) {
      logger.error('QR Code generation failed', { error: err instanceof Error ? err.message : err });
      setError('Failed to generate QR code');
      showError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      success('QR code data copied to clipboard!');
    } catch (err) {
      logger.error('Failed to copy to clipboard', { error: err instanceof Error ? err.message : err });
      showError('Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!qrCodeUrl) {
      showError('No QR code to download');
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('QR code downloaded successfully!');
    } catch (err) {
      logger.error('Failed to download QR code', { error: err instanceof Error ? err.message : err });
      showError('Failed to download QR code');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: title,
          text: qrData,
          url: getCurrentUrl()
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          success('QR code shared successfully!');
          return;
        }
      }

      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(qrData);
      success('QR code data copied to clipboard!');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        logger.error('Failed to share QR code', { error: err instanceof Error ? err.message : err });
        showError('Failed to share QR code');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription>
          Generate QR codes for sharing credential data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data to Encode
          </label>
          <div className="relative">
            <Input
              type={showData ? "text" : "password"}
              placeholder="Enter data to encode in QR code..."
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowData(!showData)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        {qrData && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">Generated QR Code</h4>
              {isGenerating ? (
                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg" style={{ width: size, height: size }}>
                  <div className="text-center text-red-600">
                    <QrCode className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Error generating QR code</p>
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code for ${title}`}
                    className="block"
                    style={{ width: size, height: size }}
                  />
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyData}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Data Preview */}
            <div className="w-full p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Data Preview</span>
                <button
                  onClick={() => setShowData(!showData)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {showData ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-sm text-gray-600 font-mono break-all">
                {showData ? qrData : "*".repeat(Math.min(qrData.length, 50))}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!qrData && (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter data above to generate a QR code</p>
            <p className="text-sm mt-1">Supports URLs, text, and credential data</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Security Notice</p>
              <p className="text-sm text-yellow-700 mt-1">
                QR codes containing sensitive data should only be shared with trusted recipients.
                Consider encrypting data before encoding.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
