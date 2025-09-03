import React, { useState, ReactElement } from 'react';
import { HandshakeRequest } from '../../shared/types';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Checkbox
} from '../../shared/components/ui';
import { AlertTriangle, CheckCircle, Clock, Shield, Eye } from 'lucide-react';


// Type definitions for component props
interface HandshakeRequestModalProps {
  request: HandshakeRequest;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (approvedFields: string[], rejectedFields: string[]) => Promise<void>;
}

export const HandshakeRequestModal: React.FC<HandshakeRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onRespond
}: HandshakeRequestModalProps): ReactElement | null => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useZeroKnowledge, setUseZeroKnowledge] = useState(false);
  const [useSelectiveDisclosure, setUseSelectiveDisclosure] = useState(true);

  const handleFieldToggle = (fieldId: string): void => {
    setSelectedFields((prev: string[]) =>
      prev.includes(fieldId)
        ? prev.filter((f: string) => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const approvedFields = selectedFields;
      const rejectedFields = request.requestedFields.filter(
        (field: string) => !selectedFields.includes(field)
      );

      await onRespond(approvedFields, rejectedFields);
      onClose();
    } catch (error) {
      console.error('Failed to respond to handshake:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldDescription = (field: string): string => {
    const fieldDescriptions: Record<string, string> = {
      'name': 'Your full legal name',
      'email': 'Email address for contact',
      'phone': 'Phone number for verification',
      'address': 'Residential address',
      'dateOfBirth': 'Date of birth for age verification',
      'nationalId': 'Government issued ID number',
      'credentials': 'Professional certifications',
      'employment': 'Employment history',
      'education': 'Educational background'
    };
    return fieldDescriptions[field] || field.replace(/([A-Z])/g, ' $1').toLowerCase();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Verification Request</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Requester Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{request.requesterName}</p>
                  <p className="text-sm text-gray-600">Requesting verification</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Purpose */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Purpose</h4>
            <p className="text-sm text-blue-700">{request.purpose}</p>
          </div>

          {/* Requested Information */}
          <div>
            <h4 className="font-medium mb-3">Requested Information</h4>
            <div className="space-y-3">
              {request.requestedFields.map((field: string) => (
                <div key={field} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => handleFieldToggle(field)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={field} className="text-sm font-medium cursor-pointer">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      {getFieldDescription(field)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Privacy Options</h4>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Selective Disclosure</p>
                  <p className="text-xs text-gray-600">Share only necessary information</p>
                </div>
              </div>
              <Checkbox
                checked={useSelectiveDisclosure}
                onCheckedChange={setUseSelectiveDisclosure}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Zero-Knowledge Proof</p>
                  <p className="text-xs text-gray-600">Prove without revealing data</p>
                </div>
              </div>
              <Checkbox
                checked={useZeroKnowledge}
                onCheckedChange={setUseZeroKnowledge}
                disabled={!useSelectiveDisclosure}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Privacy Notice</p>
                <p className="text-yellow-700 mt-1">
                  You can choose which information to share. Only approved fields will be verified.
                  Your privacy preferences will be remembered for future requests.
                </p>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedFields.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">
                  Sharing {selectedFields.length} of {request.requestedFields.length} requested fields
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedFields.length === 0}
          >
            {isLoading ? 'Processing...' : `Share Selected (${selectedFields.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
