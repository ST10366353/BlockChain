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
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Shield,
  Loader2
} from 'lucide-react';
import { VerifiableCredential } from '../types';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: VerifiableCredential[];
  onComplete: (results: BulkOperationResults) => void;
}

interface BulkOperationResults {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    credentialId: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onComplete
}) => {
  const [operation, setOperation] = useState<'verify' | 'download' | 'export'>('verify');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkOperationResults | null>(null);

  const handleStartOperation = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    const operationResults: BulkOperationResults = {
      totalProcessed: credentials.length,
      successful: 0,
      failed: 0,
      results: []
    };

    try {
      for (let i = 0; i < credentials.length; i++) {
        const credential = credentials[i];

        try {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500));

          // Simulate operation based on type
          let success = true;

          if (operation === 'verify') {
            // Simulate verification
            success = Math.random() > 0.1; // 90% success rate
          } else if (operation === 'download') {
            // Simulate download
            const blob = new Blob([JSON.stringify(credential, null, 2)], {
              type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `credential-${credential.id || `bulk-${i}`}.json`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }

          operationResults.results.push({
            credentialId: credential.id || `credential-${i}`,
            status: success ? 'success' : 'failed',
            error: success ? undefined : 'Operation failed'
          });

          if (success) {
            operationResults.successful++;
          } else {
            operationResults.failed++;
          }

        } catch (error) {
          operationResults.results.push({
            credentialId: credential.id || `credential-${i}`,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          operationResults.failed++;
        }

        // Update progress
        setProgress(((i + 1) / credentials.length) * 100);
      }

      setResults(operationResults);
      onComplete(operationResults);

    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationTitle = () => {
    switch (operation) {
      case 'verify': return 'Bulk Verification';
      case 'download': return 'Bulk Download';
      case 'export': return 'Bulk Export';
      default: return 'Bulk Operation';
    }
  };

  const getOperationDescription = () => {
    switch (operation) {
      case 'verify': return 'Verify the authenticity and validity of multiple credentials';
      case 'download': return 'Download all credentials as individual JSON files';
      case 'export': return 'Export all credentials in a single consolidated report';
      default: return 'Perform operation on multiple credentials';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>{getOperationTitle()}</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {getOperationDescription()}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Operation Selection */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={operation === 'verify' ? 'default' : 'outline'}
              className="h-20 flex-col space-y-2"
              onClick={() => setOperation('verify')}
              disabled={isProcessing}
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm">Verify</span>
            </Button>

            <Button
              variant={operation === 'download' ? 'default' : 'outline'}
              className="h-20 flex-col space-y-2"
              onClick={() => setOperation('download')}
              disabled={isProcessing}
            >
              <Download className="w-6 h-6" />
              <span className="text-sm">Download</span>
            </Button>

            <Button
              variant={operation === 'export' ? 'default' : 'outline'}
              className="h-20 flex-col space-y-2"
              onClick={() => setOperation('export')}
              disabled={isProcessing}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Export</span>
            </Button>
          </div>

          {/* Credentials Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Credentials to Process</h4>
                <p className="text-sm text-gray-600">
                  {credentials.length} credential{credentials.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <Badge variant="secondary">
                {credentials.length}
              </Badge>
            </div>
          </div>

          {/* Progress Section */}
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">
                  Processing credentials...
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm text-gray-600">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-4">
              <h4 className="font-medium">Operation Results</h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {results.successful}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {results.totalProcessed}
                  </div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">Failed Operations</h5>
                  <div className="space-y-1">
                    {results.results
                      .filter(r => r.status === 'failed')
                      .slice(0, 3)
                      .map((result, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {result.credentialId}: {result.error}
                      </div>
                    ))}
                    {results.failed > 3 && (
                      <div className="text-sm text-red-600">
                        ...and {results.failed - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h4>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Bulk operations process multiple credentials. Ensure you have
                    the necessary permissions and that all credentials are from
                    trusted sources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {!isProcessing && !results && (
            <Button
              onClick={handleStartOperation}
              disabled={credentials.length === 0}
            >
              Start {getOperationTitle()}
            </Button>
          )}

          {results && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => {
                setResults(null);
                setProgress(0);
              }}>
                Run Another Operation
              </Button>
            </div>
          )}

          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
