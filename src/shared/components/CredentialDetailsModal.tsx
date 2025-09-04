"use client";

import React from 'react';
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
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Share2
} from 'lucide-react';
import { VerifiableCredential } from '../types';
import { formatDate, formatDID } from '../../lib/utils';

interface CredentialDetailsModalProps {
  credential: VerifiableCredential;
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialDetailsModal: React.FC<CredentialDetailsModalProps> = ({
  credential,
  isOpen,
  onClose
}) => {
  const getIssuerName = (issuer: any) => {
    if (typeof issuer === 'string') {
      return formatDID(issuer);
    }
    return issuer?.name || issuer?.id || 'Unknown Issuer';
  };

  const getStatusIcon = () => {
    const now = new Date();
    const expiration = credential.expirationDate ? new Date(credential.expirationDate) : null;

    if (expiration && expiration < now) {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getStatusText = () => {
    const now = new Date();
    const expiration = credential.expirationDate ? new Date(credential.expirationDate) : null;

    if (expiration && expiration < now) {
      return 'Expired';
    }
    return 'Valid';
  };

  const getStatusColor = () => {
    const now = new Date();
    const expiration = credential.expirationDate ? new Date(credential.expirationDate) : null;

    if (expiration && expiration < now) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-green-600 bg-green-50';
  };

  const handleCopyCredential = () => {
    navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Credential Details</span>
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {credential.id || 'No ID'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {credential.type.map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issuer</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{getIssuerName(credential.issuer)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">
                    {credential.credentialSubject?.id || 'No subject ID'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Issued</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {formatDate(credential.issuanceDate)}
                    </span>
                  </div>
                </div>
                {credential.expirationDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expires</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(credential.expirationDate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credential Subject */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Credential Subject</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(credential.credentialSubject, null, 2)}
              </pre>
            </div>
          </div>

          {/* Proof Information */}
          {credential.proof && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Proof Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <p className="text-sm mt-1">
                      {typeof credential.proof === 'object'
                        ? credential.proof.type
                        : 'Standard Proof'}
                    </p>
                  </div>
                  {typeof credential.proof === 'object' && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Method</label>
                      <p className="text-sm mt-1">
                        {credential.proof.verificationMethod || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Raw Credential Data */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Raw Credential Data</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Technical details (scrollable)
                </span>
                <span className="text-xs text-gray-500">
                  {JSON.stringify(credential).length} characters
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
                <pre className="text-xs p-3 overflow-x-auto bg-white">
                  {JSON.stringify(credential, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopyCredential}>
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
