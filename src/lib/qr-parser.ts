// QR Code parsing and validation utilities for IdentityVault

export interface ParsedQRCode {
  type: 'credential' | 'did' | 'url' | 'vc' | 'unknown';
  data: any;
  raw: string;
  isValid: boolean;
  error?: string;
}

// Regular expressions for different QR code formats
const DID_REGEX = /^did:[a-z0-9]+:.+/i;
const VC_REGEX = /^VC[0-9]+-.+/i;
const URL_REGEX = /^https?:\/\/.+/i;
const CREDENTIAL_SHARE_REGEX = /\/share\/[a-zA-Z0-9]+$/;

/**
 * Parse and validate QR code content
 */
export function parseQRCode(content: string): ParsedQRCode {
  try {
    const trimmed = content.trim();

    // Check for DID format
    if (DID_REGEX.test(trimmed)) {
      return {
        type: 'did',
        data: {
          did: trimmed,
          method: trimmed.split(':')[1],
          identifier: trimmed.split(':').slice(2).join(':'),
        },
        raw: trimmed,
        isValid: true,
      };
    }

    // Check for Verifiable Credential format
    if (VC_REGEX.test(trimmed)) {
      return {
        type: 'vc',
        data: {
          vcId: trimmed,
          version: trimmed.split('-')[0],
          hash: trimmed.split('-').slice(1).join('-'),
        },
        raw: trimmed,
        isValid: true,
      };
    }

    // Check for URL format
    if (URL_REGEX.test(trimmed)) {
      const url = new URL(trimmed);

      // Check if it's a credential share URL
      if (CREDENTIAL_SHARE_REGEX.test(url.pathname)) {
        const shareCode = url.pathname.split('/').pop();
        return {
          type: 'credential',
          data: {
            shareCode,
            host: url.host,
            fullUrl: trimmed,
          },
          raw: trimmed,
          isValid: true,
        };
      }

      return {
        type: 'url',
        data: {
          url: trimmed,
          host: url.host,
          pathname: url.pathname,
          search: url.search,
        },
        raw: trimmed,
        isValid: true,
      };
    }

    // Try to parse as JSON (might be a JWT or other structured data)
    try {
      const jsonData = JSON.parse(trimmed);
      return {
        type: 'credential',
        data: jsonData,
        raw: trimmed,
        isValid: true,
      };
    } catch {
      // Not JSON, continue
    }

    // If nothing matches, mark as unknown but still return the data
    return {
      type: 'unknown',
      data: trimmed,
      raw: trimmed,
      isValid: false,
      error: 'Unknown QR code format',
    };

  } catch (error) {
    return {
      type: 'unknown',
      data: content,
      raw: content,
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to parse QR code',
    };
  }
}

/**
 * Validate QR code format without parsing
 */
export function validateQRCodeFormat(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();

  // Check basic format requirements
  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.length > 4096) { // Reasonable limit for QR codes
    return false;
  }

  return true;
}

/**
 * Extract DID from various formats
 */
export function extractDID(content: string): string | null {
  const parsed = parseQRCode(content);

  if (parsed.type === 'did') {
    return parsed.data.did;
  }

  // Try to find DID in text content
  const didMatch = content.match(DID_REGEX);
  return didMatch ? didMatch[0] : null;
}

/**
 * Extract share code from URLs
 */
export function extractShareCode(content: string): string | null {
  const parsed = parseQRCode(content);

  if (parsed.type === 'credential' && parsed.data.shareCode) {
    return parsed.data.shareCode;
  }

  return null;
}

/**
 * Check if QR code contains sensitive data that should be handled carefully
 */
export function containsSensitiveData(content: string): boolean {
  // Check for potential PII or sensitive patterns
  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
    /\b\d{16}\b/, // Credit card pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
    /\b\d{10,15}\b/, // Phone number pattern
  ];

  return sensitivePatterns.some(pattern => pattern.test(content));
}

/**
 * Get QR code type description for UI display
 */
export function getQRCodeTypeDescription(type: ParsedQRCode['type']): string {
  const descriptions = {
    did: 'Decentralized Identifier',
    credential: 'Credential Share Link',
    vc: 'Verifiable Credential',
    url: 'Web URL',
    unknown: 'Unknown Format',
  };

  return descriptions[type] || 'Unknown';
}

/**
 * Generate a preview of QR code content for UI display
 */
export function generateQRPreview(content: string, maxLength: number = 50): string {
  const parsed = parseQRCode(content);

  if (parsed.type === 'did') {
    return `DID: ${parsed.data.method}:${parsed.data.identifier.substring(0, 20)}...`;
  }

  if (parsed.type === 'vc') {
    return `VC: ${parsed.data.vcId.substring(0, 20)}...`;
  }

  if (parsed.type === 'credential') {
    return `Share: ${parsed.data.shareCode}`;
  }

  if (parsed.type === 'url') {
    return parsed.data.host + parsed.data.pathname;
  }

  // For unknown or long content, truncate
  return content.length > maxLength
    ? content.substring(0, maxLength) + '...'
    : content;
}
