"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  QrCode,
  Link,
  Copy,
  Mail,
  MessageSquare,
  Share2,
  CheckCircle
} from 'lucide-react';
import { VerifiableCredential } from '../types';
import { formatDID } from '../../lib/utils';
import { toast } from '../../components/ui/use-toast';

interface ShareCredentialModalProps {
  credential: VerifiableCredential;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCredentialModal: React.FC<ShareCredentialModalProps> = ({
  credential,
  isOpen,
  onClose
}) => {
  const [shareMethod, setShareMethod] = useState<'qr' | 'link' | 'copy' | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    // In a real implementation, this would create a secure share URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareId = `share_${credential.id || 'credential'}_${Date.now()}`;
    const url = `${baseUrl}/share/${shareId}`;
    setShareUrl(url);
    return url;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyCredential = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Credential Copied",
        description: "Credential data copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy credential:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy credential data",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = `Shared Credential: ${credential.type.join(', ')}`;
    const body = `I've shared a verifiable credential with you:\n\n${JSON.stringify(credential, null, 2)}\n\nShared via DID Wallet`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleWhatsAppShare = () => {
    const text = `I've shared a verifiable credential with you. View it here: ${generateShareUrl()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share Credential</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Choose how you want to share this credential
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credential Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">
                  {credential.type.join(', ')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Issued by: {formatDID(
                    typeof credential.issuer === 'string'
                      ? credential.issuer
                      : credential.issuer?.id || 'Unknown'
                  )}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {credential.id ? 'Has ID' : 'No ID'}
              </Badge>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setShareMethod('qr')}
            >
              <QrCode className="w-6 h-6" />
              <span className="text-sm">QR Code</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={handleCopyLink}
            >
              <Link className="w-6 h-6" />
              <span className="text-sm">Share Link</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={handleCopyCredential}
            >
              <Copy className="w-6 h-6" />
              <span className="text-sm">Copy Data</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setShareMethod('copy')}
            >
              <Share2 className="w-6 h-6" />
              <span className="text-sm">More Options</span>
            </Button>
          </div>

          {/* QR Code Display */}
          {shareMethod === 'qr' && (
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  QR Code would be generated here
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to share the credential instantly
              </p>
            </div>
          )}

          {/* Copy Options */}
          {shareMethod === 'copy' && (
            <div className="space-y-4">
              <h4 className="font-medium">Share via:</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleEmailShare}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={handleWhatsAppShare}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}

          {/* Copy Confirmation */}
          {copied && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Copied to clipboard!</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Share2 className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h4>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Only share credentials with trusted parties. The recipient will be able
                    to view all credential information including proof data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
