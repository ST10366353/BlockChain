# IdentityVault API Documentation

[![API Version](https://img.shields.io/badge/API-v1.0.0-blue.svg)](https://api.identityvault.com)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.0-green.svg)](https://swagger.io/specification/)

> Complete API reference for IdentityVault's REST endpoints, authentication, and data models.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Credentials](#credentials)
- [Handshake](#handshake)
- [Analytics](#analytics)
- [Audit](#audit)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

### POST /api/auth/login/passphrase

Authenticate using a recovery passphrase.

**Request Body:**
```json
{
  "passphrase": "twelve word recovery phrase",
  "did": "did:example:optional-did-identifier"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "did": "did:example:123456",
      "email": "user@example.com",
      "name": "John Doe",
      "type": "consumer",
      "walletAddress": "0x1234567890abcdef"
    },
    "token": "jwt_access_token_here",
    "refreshToken": "jwt_refresh_token_here"
  }
}
```

### POST /api/auth/login/did

Authenticate using Decentralized Identifier.

**Request Body:**
```json
{
  "did": "did:example:123456789abcdef",
  "challenge": "random_challenge_string",
  "signature": "cryptographic_signature"
}
```

### POST /api/auth/login/biometric

Authenticate using WebAuthn biometric credentials.

**Request Body:**
```json
{
  "credentialId": "webauthn_credential_id",
  "authenticatorData": "base64_encoded_data",
  "clientDataJSON": "base64_encoded_json",
  "signature": "base64_encoded_signature"
}
```

### POST /api/auth/refresh

Refresh JWT access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### POST /api/auth/logout

Invalidate current session.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "did": "did:example:123456",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "consumer",
    "walletAddress": "0x1234567890abcdef",
    "createdAt": "2023-01-15T10:30:00Z",
    "updatedAt": "2023-12-01T14:20:00Z"
  }
}
```

## 📜 Credentials

### GET /api/credentials

List user credentials with pagination and filtering.

**Query Parameters:**
- `type` (string): Filter by credential type
- `status` (string): Filter by status (active, expired, revoked)
- `limit` (number): Items per page (default: 20, max: 100)
- `offset` (number): Pagination offset (default: 0)

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credentials": [
      {
        "id": "cred_123",
        "name": "University Degree",
        "type": "Educational",
        "issuer": "MIT University",
        "holder": "did:example:123456",
        "description": "Bachelor of Computer Science",
        "status": "active",
        "issuedAt": "2023-01-15T10:30:00Z",
        "expirationDate": "2028-01-15T10:30:00Z",
        "metadata": {
          "gpa": "3.8",
          "graduationYear": "2023"
        }
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /api/credentials

Create a new credential.

**Request Body:**
```json
{
  "name": "Driver License",
  "type": "Government",
  "issuer": "DMV",
  "description": "Class C Driver License",
  "expirationDate": "2027-06-10T00:00:00Z",
  "metadata": {
    "licenseNumber": "D123456789",
    "class": "C",
    "restrictions": "None"
  }
}
```

### GET /api/credentials/{id}

Get detailed credential information.

**Path Parameters:**
- `id` (string): Credential ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cred_123",
    "name": "University Degree",
    "type": "Educational",
    "issuer": "MIT University",
    "holder": "did:example:123456",
    "description": "Bachelor of Computer Science",
    "status": "active",
    "issuedAt": "2023-01-15T10:30:00Z",
    "expirationDate": "2028-01-15T10:30:00Z",
    "verifiableCredential": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "UniversityDegree"],
      "issuer": "did:example:issuer",
      "issuanceDate": "2023-01-15T10:30:00Z",
      "credentialSubject": {
        "id": "did:example:123456",
        "degree": {
          "type": "BachelorDegree",
          "name": "Bachelor of Computer Science"
        }
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-01-15T10:30:00Z",
        "verificationMethod": "did:example:issuer#keys-1",
        "proofPurpose": "assertionMethod",
        "proofValue": "signature_here"
      }
    }
  }
}
```

### PUT /api/credentials/{id}

Update credential information.

**Request Body:**
```json
{
  "name": "Updated University Degree",
  "description": "Updated description",
  "metadata": {
    "gpa": "3.9",
    "honors": "Summa Cum Laude"
  }
}
```

### DELETE /api/credentials/{id}

Delete a credential.

**Response:**
```json
{
  "success": true,
  "message": "Credential deleted successfully"
}
```

### POST /api/credentials/import

Import credential from external source.

**Request Body:**
```json
{
  "format": "json",
  "content": "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\"],\"type\":[\"VerifiableCredential\"],\"issuer\":\"did:example:issuer\",\"credentialSubject\":{\"id\":\"did:example:holder\",\"claim\":\"value\"}}"
}
```

### POST /api/credentials/{id}/export

Export credential in specified format.

**Request Body:**
```json
{
  "format": "jwt",
  "includeProof": true
}
```

### POST /api/credentials/{id}/verify

Verify credential authenticity.

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "verificationResult": {
      "issuerVerified": true,
      "signatureVerified": true,
      "notExpired": true,
      "notRevoked": true,
      "verificationDate": "2023-12-01T14:20:00Z"
    }
  }
}
```

### POST /api/credentials/{id}/share

Share credential with another user.

**Request Body:**
```json
{
  "recipientDID": "did:example:recipient",
  "expiresIn": 3600,
  "message": "Please verify my degree"
}
```

## 🤝 Handshake

### GET /api/handshake/requests

List handshake requests.

**Query Parameters:**
- `type` (string): 'sent' or 'received'
- `status` (string): 'pending', 'approved', 'rejected'
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_123",
        "requesterId": "user_456",
        "requesterName": "Jane Smith",
        "requesterDID": "did:example:456789",
        "credentialId": "cred_123",
        "credentialName": "University Degree",
        "requestType": "verify",
        "status": "pending",
        "message": "Please verify my degree for employment",
        "requestedFields": ["name", "issuer", "issuedAt"],
        "expiresAt": "2023-12-08T14:20:00Z",
        "createdAt": "2023-12-01T14:20:00Z"
      }
    ],
    "total": 1
  }
}
```

### POST /api/handshake/requests

Create handshake request.

**Request Body:**
```json
{
  "credentialId": "cred_123",
  "requestType": "verify",
  "message": "Please verify my credentials",
  "requestedFields": ["name", "issuer", "issuedAt"],
  "expiresIn": 3600
}
```

### POST /api/handshake/requests/{id}/respond

Respond to handshake request.

**Request Body:**
```json
{
  "action": "approve",
  "message": "Credentials verified successfully",
  "approvedFields": ["name", "issuer", "issuedAt"]
}
```

### POST /api/handshake/qr/generate

Generate QR code for sharing.

**Request Body:**
```json
{
  "credentialId": "cred_123",
  "expiresIn": 3600,
  "oneTime": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "shareUrl": "https://app.identityvault.com/share/abc123",
    "expiresAt": "2023-12-01T15:20:00Z"
  }
}
```

## 📊 Analytics

### GET /api/analytics/dashboard

Get dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "credentials": {
      "total": 12,
      "active": 10,
      "expired": 1,
      "revoked": 1
    },
    "handshake": {
      "totalRequests": 25,
      "approvedRequests": 20,
      "rejectedRequests": 3,
      "pendingRequests": 2,
      "successRate": 80.0
    },
    "activity": [
      {
        "date": "2023-12-01",
        "credentialsCreated": 2,
        "handshakeRequests": 5,
        "verifications": 3
      }
    ]
  }
}
```

### GET /api/analytics/usage

Get usage statistics.

**Query Parameters:**
- `period` (string): 'day', 'week', 'month', 'year'
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string

## 🔍 Audit

### GET /api/audit/logs

Get audit logs.

**Query Parameters:**
- `action` (string): Filter by action type
- `resource` (string): Filter by resource type
- `userId` (string): Filter by user
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "timestamp": "2023-12-01T14:20:00Z",
        "action": "credential_created",
        "resource": "credential",
        "resourceId": "cred_123",
        "userId": "user_456",
        "userName": "John Doe",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "credentialName": "University Degree",
          "credentialType": "Educational"
        }
      }
    ],
    "total": 1
  }
}
```

## 📋 Data Models

### User
```typescript
interface User {
  id: string;
  did: string;
  email?: string;
  name?: string;
  type: 'consumer' | 'enterprise' | 'power-user';
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Credential
```typescript
interface Credential {
  id: string;
  name: string;
  type: string;
  issuer: string;
  holder: string;
  description?: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'revoked';
  issuedAt: string;
  metadata?: Record<string, any>;
  verifiableCredential?: any;
}
```

### HandshakeRequest
```typescript
interface HandshakeRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDID: string;
  credentialId: string;
  credentialName: string;
  requestType: 'share' | 'verify' | 'transfer';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  message?: string;
  requestedFields?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## ⚠️ Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource conflict
- `RATE_LIMIT_ERROR`: Too many requests
- `INTERNAL_ERROR`: Server error

## 🚦 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 5 requests per minute
- **Bulk operations**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

When rate limited, you'll receive:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## 🔒 Authentication

All API requests require authentication except for login endpoints. Include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

Tokens expire after 15 minutes. Use the refresh endpoint to get new tokens.

## 📞 Support

For API support:
- Email: api@identityvault.com
- Documentation: https://docs.identityvault.com/api
- Status: https://status.identityvault.com

---

**API Version:** 1.0.0 | **Last Updated:** December 2023
