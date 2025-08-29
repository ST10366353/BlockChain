# Complete DID Backend API Endpoints Documentation

This document contains a comprehensive list of all expected API endpoints based on the DID wallet frontend application analysis.

## 📋 Overview

The DID wallet application expects a comprehensive backend API with 37+ endpoints covering:
- DID Management & Resolution
- Verifiable Credentials (VC) lifecycle
- Trust Registry management
- User Profile & Authentication
- Audit Logging & Monitoring
- Verifiable Presentations
- Data Export/Import
- Real-time Notifications

---

## 🌐 System & Health Endpoints

### Health & Status
- `GET /health` - System health check
- `GET /api/v1` - API version information
- `GET /status` - System status information

---

## 🆔 DID Management Endpoints

### DID Registration & Resolution
- `POST /did/register` - Register new DID
- `GET /did/resolve/{did}` - Resolve DID to DID Document
- `PUT /did/{did}` - Update DID document
- `DELETE /did/{did}` - Delete/Deactivate DID
- `POST /did` - Update DID document (alternative)

### DID Registry
- `GET /registry/{did}` - Get DID registry entry
- `GET /did/{did}/events` - Get DID lifecycle events
- `GET /did/registry` - List DID registry entries
- `POST /did/registry/search` - Search DID registry

### DID Methods Support
- `GET /did/methods` - List supported DID methods
- `GET /did/methods/{method}` - Get DID method details

---

## 📜 Verifiable Credentials (VC) Endpoints

### Credential Issuance
- `POST /credentials/issue` - Issue new credential
- `POST /credentials/request` - Request credential from issuer
- `GET /credentials/templates` - Get credential templates
- `POST /credentials/templates` - Create credential template

### Credential Management
- `GET /credentials` - Query user credentials
- `GET /credentials/{id}` - Get credential by ID
- `PUT /credentials/{id}` - Update credential
- `DELETE /credentials/{id}` - Delete credential

### Credential Verification
- `POST /credentials/verify` - Verify credential authenticity
- `GET /credentials/{id}/verify` - Get verification status
- `POST /credentials/batch/verify` - Batch verify credentials

### Credential Revocation
- `POST /credentials/{id}/revoke` - Revoke credential
- `GET /credentials/{id}/revocation` - Get revocation status
- `POST /credentials/batch/revoke` - Batch revoke credentials

---

## 🏛️ Trust Registry Endpoints

### Issuer Management
- `GET /trust/issuers` - List trusted issuers
- `GET /trust/issuers/{did}` - Get issuer details
- `POST /trust/issuers` - Add trusted issuer
- `PUT /trust/issuers/{did}` - Update trusted issuer
- `DELETE /trust/issuers/{did}` - Remove trusted issuer

### Trust Policies
- `GET /trust/policies` - List trust policies
- `POST /trust/policies` - Create trust policy
- `PUT /trust/policies/{id}` - Update trust policy
- `DELETE /trust/policies/{id}` - Delete trust policy

### Verification Policies
- `GET /trust/verification-policies` - List verification policies
- `POST /trust/verification-policies` - Create verification policy
- `PUT /trust/verification-policies/{id}` - Update verification policy

---

## 🔐 Authentication & Authorization Endpoints

### OIDC Integration
- `GET /auth/oidc/authorize` - OIDC authorization endpoint
- `POST /auth/oidc/token` - OIDC token endpoint
- `GET /auth/oidc/userinfo` - Get user info via OIDC
- `POST /auth/oidc/introspect` - Token introspection
- `POST /auth/oidc/revoke` - Revoke token

### Session Management
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/session` - Get current session
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

### WebAuthn/FIDO2
- `POST /auth/webauthn/register` - Register WebAuthn credential
- `POST /auth/webauthn/authenticate` - WebAuthn authentication
- `GET /auth/webauthn/credentials` - List user WebAuthn credentials

---

## 👤 User Profile & Management Endpoints

### Profile Management
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /profile/{userId}` - Get specific user profile

### Avatar Management
- `POST /profile/avatar` - Upload avatar
- `GET /profile/avatar` - Get avatar
- `DELETE /profile/avatar` - Delete avatar

### Preferences
- `GET /profile/preferences` - Get user preferences
- `PUT /profile/preferences` - Update user preferences
- `GET /profile/preferences/notifications` - Get notification preferences
- `PUT /profile/preferences/notifications` - Update notification preferences

### Security Settings
- `POST /profile/change-password` - Change password
- `GET /profile/security` - Get security settings
- `PUT /profile/security` - Update security settings
- `POST /profile/2fa/enable` - Enable 2FA
- `POST /profile/2fa/disable` - Disable 2FA

### Statistics & Analytics
- `GET /profile/stats` - Get user statistics
- `GET /profile/activity` - Get user activity log
- `GET /profile/usage` - Get usage statistics

---

## 📊 Audit & Monitoring Endpoints

### Audit Logs
- `GET /audit/logs` - Get audit logs
- `GET /audit/logs/{id}` - Get specific audit log
- `GET /audit/logs/export` - Export audit logs
- `POST /audit/logs/search` - Search audit logs

### Audit Analytics
- `GET /audit/stats` - Get audit statistics
- `GET /audit/stats/actions` - Get action statistics
- `GET /audit/stats/timeframe` - Get timeframe statistics
- `GET /audit/metrics` - Get audit metrics

### System Monitoring
- `GET /audit/system/metrics` - Get system metrics
- `GET /audit/system/health` - Get system health
- `GET /audit/system/performance` - Get performance metrics

---

## 📄 Verifiable Presentations Endpoints

### Presentation Management
- `POST /presentations` - Create presentation
- `GET /presentations` - List user presentations
- `GET /presentations/{id}` - Get presentation details
- `DELETE /presentations/{id}` - Delete presentation

### Presentation Templates
- `GET /presentations/templates` - Get presentation templates
- `POST /presentations/templates` - Create template
- `PUT /presentations/templates/{id}` - Update template
- `DELETE /presentations/templates/{id}` - Delete template

### Presentation Verification
- `POST /presentations/verify` - Verify presentation
- `GET /presentations/{id}/verify` - Get verification status

### Selective Disclosure
- `POST /presentations/selective` - Create selective presentation
- `GET /presentations/{id}/disclosure` - Get disclosure details

---

## 📤 Data Export/Import Endpoints

### Wallet Data
- `GET /export/wallet` - Export wallet data
- `POST /import/wallet` - Import wallet data
- `GET /export/wallet/status` - Get export status

### Credentials Export
- `GET /export/credentials` - Export credentials
- `POST /export/credentials/batch` - Batch export credentials
- `GET /export/credentials/{format}` - Export in specific format

### Backup & Recovery
- `POST /backup/create` - Create backup
- `GET /backup/list` - List backups
- `POST /backup/restore` - Restore from backup
- `DELETE /backup/{id}` - Delete backup

---

## 🔔 Real-time Notifications Endpoints

### Notification Management
- `GET /notifications` - Get user notifications
- `GET /notifications/{id}` - Get notification details
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/{id}/unread` - Mark as unread
- `DELETE /notifications/{id}` - Delete notification
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications` - Delete all notifications

### Notification Preferences
- `GET /notifications/preferences` - Get notification preferences
- `PUT /notifications/preferences` - Update notification preferences

### Notification Statistics
- `GET /notifications/stats` - Get notification statistics
- `GET /notifications/templates` - Get notification templates

### WebSocket Connection
- `GET /ws/notifications` - WebSocket endpoint for real-time notifications

---

## 🔍 Advanced Search & Filtering

### Search Endpoints
- `POST /search/credentials` - Search credentials
- `POST /search/connections` - Search connections
- `POST /search/presentations` - Search presentations
- `POST /search/audit` - Search audit logs

### Filter Endpoints
- `GET /filters/credentials` - Get credential filters
- `GET /filters/connections` - Get connection filters
- `GET /filters/presentations` - Get presentation filters

---

## ⚙️ System Configuration Endpoints

### API Configuration
- `GET /config` - Get API configuration
- `PUT /config` - Update API configuration

### Feature Flags
- `GET /features` - Get feature flags
- `PUT /features/{flag}` - Update feature flag

### Rate Limiting
- `GET /ratelimit/status` - Get rate limit status
- `POST /ratelimit/reset` - Reset rate limits

---

## 📋 Request/Response Formats

### Common Query Parameters
- `limit` - Number of results to return
- `offset` - Pagination offset
- `sort` - Sort field
- `order` - Sort order (asc/desc)
- `search` - Search query
- `filter` - Filter parameters
- `startDate` - Start date for filtering
- `endDate` - End date for filtering

### Common Response Format
```json
{
  "data": "...",
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "status": "success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Authentication Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
X-API-Key: <api_key>
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "...",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "status": "error"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔗 Integration Notes

### WebSocket Events
- `notification.new` - New notification received
- `credential.updated` - Credential status changed
- `connection.updated` - Connection status changed
- `presentation.verified` - Presentation verification completed

### Batch Operations Support
- Bulk credential verification
- Bulk credential revocation
- Batch export operations
- Bulk notification management

### Pagination Support
All list endpoints support pagination with:
- `limit` and `offset` parameters
- `total` count in response metadata
- `hasMore` flag for infinite scroll

---

## 📊 Monitoring & Analytics

### Metrics Endpoints
- `GET /metrics/requests` - Request metrics
- `GET /metrics/errors` - Error metrics
- `GET /metrics/performance` - Performance metrics
- `GET /metrics/usage` - Usage statistics

This comprehensive API documentation covers all endpoints expected by the DID wallet frontend application. The backend implementation should provide these endpoints with proper error handling, authentication, and data validation.
