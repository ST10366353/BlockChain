import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalDescription
} from "@/components/ui/modal";
import {
  Share2,
  QrCode,
  Link,
  Users,
  Copy,
  CheckCircle
} from "lucide-react";
import { credentialsService } from "@/lib/api/credentials-service";
import { useAppStore } from "@/stores";
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";

interface ShareCredentialModalProps {
  credential: any;
  onShare: (options: ShareOptions) => void;
}

interface ShareOptions {
  method: 'link' | 'qr' | 'direct';
  recipientDID?: string;
  expiresIn?: number;
  oneTime?: boolean;
  message?: string;
}

export function ShareCredentialModal({ credential, onShare }: ShareCredentialModalProps) {
  const [shareMethod, setShareMethod] = useState<'link' | 'qr' | 'direct'>('link');
  const [recipientDID, setRecipientDID] = useState('');
  const [expiresIn, setExpiresIn] = useState(7); // days
  const [oneTime, setOneTime] = useState(false);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { addNotification } = useAppStore();
  const { success } = useToast();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  if (!credential) return null;

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      let result;

      switch (shareMethod) {
        case 'link':
          result = await credentialsService.shareCredential(credential.id, {
            expiresIn: expiresIn * 24 * 60 * 60 * 1000, // Convert days to milliseconds
            oneTime
          });
          setShareUrl(result.shareUrl);
          success(`Share link generated! Valid for ${expiresIn} day${expiresIn !== 1 ? 's' : ''}`);
          break;

        case 'qr':
          // Generate QR code data for sharing
          const qrData = JSON.stringify({
            type: 'credential-share',
            credentialId: credential.id,
            expiresIn: expiresIn * 24 * 60 * 60 * 1000,
            oneTime,
            timestamp: Date.now()
          });
          setShareUrl(qrData);
          success('QR code generated for sharing');
          break;

        case 'direct':
          if (!recipientDID.trim()) {
            addNotification({
              type: 'error',
              title: 'Recipient Required',
              message: 'Please enter a recipient DID to share directly'
            });
            return;
          }
          // Use the handshake service for direct sharing
          result = await import('@/lib/api/handshake-service').then(module =>
            module.handshakeService.shareCredentialDirect(credential.id, {
              recipientDID: recipientDID.trim(),
              message: message.trim() || undefined,
              expiresIn: expiresIn * 24 * 60 * 60 * 1000
            })
          );
          success('Credential shared successfully!');
          onShare({
            method: 'direct',
            recipientDID: recipientDID.trim(),
            expiresIn: expiresIn * 24 * 60 * 60 * 1000,
            message: message.trim() || undefined
          });
          break;
      }

      if (shareMethod !== 'direct') {
        onShare({
          method: shareMethod,
          expiresIn: expiresIn * 24 * 60 * 60 * 1000,
          oneTime
        });
      }
    } catch (error) {
      logger.error('Failed to share credential', error);
      addNotification({
        type: 'error',
        title: 'Sharing Failed',
        message: 'Failed to share credential. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);

        // Clear any existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        // Set new timeout with cleanup
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
        success('Link copied to clipboard!');
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Copy Failed',
          message: 'Failed to copy to clipboard'
        });
      }
    }
  };

  const shareMethods = [
    {
      id: 'link' as const,
      title: 'Share Link',
      description: 'Generate a shareable link',
      icon: Link,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'qr' as const,
      title: 'QR Code',
      description: 'Generate QR code for sharing',
      icon: QrCode,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'direct' as const,
      title: 'Direct Share',
      description: 'Share directly with recipient',
      icon: Users,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <>
      <ModalHeader>
        <ModalTitle>Share Credential</ModalTitle>
        <ModalDescription>
          Share "{credential.name}" with others securely
        </ModalDescription>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-6">
          {/* Share Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose sharing method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shareMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      shareMethod === method.id
                        ? 'ring-2 ring-indigo-500 border-indigo-500'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setShareMethod(method.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="oneTime"
                checked={oneTime}
                onChange={(e) => setOneTime(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="oneTime" className="ml-2 text-sm text-gray-600">
                One-time use only
              </label>
            </div>

            {shareMethod === 'direct' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient DID
                  </label>
                  <Input
                    type="text"
                    placeholder="did:example:123abc..."
                    value={recipientDID}
                    onChange={(e) => setRecipientDID(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    placeholder="Add a personal message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generated Share URL/QR */}
          {shareUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {shareMethod === 'qr' ? 'QR Code Data' : 'Share Link'}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-white border rounded p-2">
                <code className="text-xs text-gray-600 break-all">
                  {shareMethod === 'qr' ? 'QR Code generated - ready to scan' : shareUrl}
                </code>
              </div>
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={() => onShare({ method: shareMethod })}>
          Cancel
        </Button>
        <Button
          onClick={handleShare}
          disabled={isGenerating || (shareMethod === 'direct' && !recipientDID.trim())}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Share Credential
            </>
          )}
        </Button>
      </ModalFooter>
    </>
  );
}
