import React from 'react';
import { VerifiableCredential, UserType } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  FileText,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Share2,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { formatDate, truncateText } from '../../lib/utils';

interface CredentialCardProps {
  credential: VerifiableCredential;
  userType: UserType;
  onView?: (credential: VerifiableCredential) => void;
  onShare?: (credential: VerifiableCredential) => void;
  onDownload?: (credential: VerifiableCredential) => void;
  onDelete?: (credential: VerifiableCredential) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  userType,
  onView,
  onShare,
  onDownload,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const isValid = () => {
    if (!credential.expirationDate) return true;
    return new Date(credential.expirationDate) > new Date();
  };

  const getStatusBadge = () => {
    if (!isValid()) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (credential.proof && credential.proof.length > 0) {
      return (
        <Badge variant="secondary" className="text-xs text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getCredentialType = () => {
    if (!credential.type) return 'Credential';

    // Extract the main type (skip VerifiableCredential)
    const types = credential.type.filter(type => type !== 'VerifiableCredential');
    return types.length > 0 ? types[0] : 'Credential';
  };

  const getIssuerName = () => {
    if (typeof credential.issuer === 'string') {
      return credential.issuer.split(':').pop() || 'Unknown Issuer';
    }

    return credential.issuer?.name || 'Unknown Issuer';
  };

  const getSubjectName = () => {
    const subject = credential.credentialSubject;
    if (subject.name) return subject.name;
    if (subject.id) return subject.id.split(':').pop() || 'Anonymous';
    return 'Anonymous';
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {getCredentialType()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {getIssuerName()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {showActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(credential);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getCredentialType()}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{getIssuerName()}</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm text-gray-600">Subject</p>
            <p className="font-medium">{getSubjectName()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Issued</p>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(credential.issuanceDate)}</span>
              </div>
            </div>

            {credential.expirationDate && (
              <div>
                <p className="text-gray-600">Expires</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span className={isValid() ? '' : 'text-red-600'}>
                    {formatDate(credential.expirationDate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Credential summary */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Fields</p>
            <div className="flex flex-wrap gap-1">
              {Object.keys(credential.credentialSubject)
                .filter(key => key !== 'id')
                .slice(0, 3)
                .map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Badge>
                ))}
              {Object.keys(credential.credentialSubject).length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(credential.credentialSubject).length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(credential)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>

              {userType !== 'enterprise' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare?.(credential)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload?.(credential)}
              >
                <Download className="w-4 h-4" />
              </Button>

              {userType === 'enterprise' && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(credential)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Enterprise-specific metadata */}
        {userType === 'enterprise' && credential.id && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Credential ID: {truncateText(credential.id, 20)}
            </p>
            {credential.proof && (
              <p className="text-xs text-gray-600 mt-1">
                Proofs: {credential.proof.length}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Credential grid component
interface CredentialGridProps {
  credentials: VerifiableCredential[];
  userType: UserType;
  onView?: (credential: VerifiableCredential) => void;
  onShare?: (credential: VerifiableCredential) => void;
  onDownload?: (credential: VerifiableCredential) => void;
  onDelete?: (credential: VerifiableCredential) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export const CredentialGrid: React.FC<CredentialGridProps> = ({
  credentials,
  userType,
  onView,
  onShare,
  onDownload,
  onDelete,
  compact = false,
  emptyMessage = "No credentials found"
}) => {
  if (credentials.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">{emptyMessage}</p>
        <p className="text-sm text-gray-500">
          Credentials will appear here once issued or imported
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {credentials.map((credential, index) => (
          <CredentialCard
            key={credential.id || `credential-${index}`}
            credential={credential}
            userType={userType}
            onView={onView}
            onShare={onShare}
            onDownload={onDownload}
            onDelete={onDelete}
            compact={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {credentials.map((credential, index) => (
        <CredentialCard
          key={credential.id || `credential-${index}`}
          credential={credential}
          userType={userType}
          onView={onView}
          onShare={onShare}
          onDownload={onDownload}
          onDelete={onDelete}
          compact={false}
        />
      ))}
    </div>
  );
};
