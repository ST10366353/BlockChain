# Complete DID Blockchain API Endpoints Documentation

This document contains the comprehensive list of API endpoints for the DID Blockchain application based on the actual implementation.

##  Overview

The DID Blockchain application implements a comprehensive API with 40+ endpoints covering:
- DID Management & Resolution
- Verifiable Credentials lifecycle
- Trust Registry management
- User Profile & Authentication
- Audit Logging & Monitoring
- Verifiable Presentations
- Data Export/Import
- Real-time Notifications
- OIDC Integration

---

##  System & Health Endpoints

### Health & Status
- \GET /health\ - System health check
- \GET /api/v1\ - API version information

---

##  DID Management Endpoints

### DID Resolution & Registration
- \GET /did/resolve/{did}\ - Resolve DID to DID Document
- \POST /did/register\ - Register new DID
- \PUT /did/{did}\ - Update DID document
- \DELETE /did/{did}\ - Delete/Deactivate DID

### DID Registry & Events
- \GET /registry/{did}\ - Get DID registry entry
- \GET /did/{did}/events\ - Get DID lifecycle events

### DID Operations
- \POST /did\ - Update DID document (alternative endpoint)
- Batch DID resolution support available

---

##  Verifiable Credentials Endpoints

### Credential Issuance
- \POST /credentials/issue\ - Issue new verifiable credential
- Support for both full and simplified issuance requests

### Credential Verification
- \POST /credentials/verify\ - Verify credential authenticity
- \POST /presentations/verify\ - Verify verifiable presentation

### Credential Management
- \GET /credentials/subject/{subjectDid}\ - Get credentials by subject DID
- \GET /credentials/issuer/{issuerDid}\ - Get credentials by issuer DID
- \GET /credentials\ - Query credentials with filters
- \POST /credentials/{id}/revoke\ - Revoke specific credential
- \GET /credentials/{id}/revocation-status\ - Check revocation status

### Batch Operations
- Batch credential verification
- Batch credential revocation

---

##  Trust Registry Endpoints

### Issuer Management
- \GET /trust/issuers\ - List trusted issuers
- \GET /trust/issuer/{did}\ - Get issuer details
- \POST /trust/issuers\ - Add trusted issuer
- \PUT /trust/issuers/{did}\ - Update trusted issuer
- \DELETE /trust/issuers/{did}\ - Remove trusted issuer

### Schema Management
- \GET /trust/schemas\ - List credential schemas
- \POST /trust/schemas\ - Create new schema
- \PUT /trust/schemas/{id}\ - Update schema
- \DELETE /trust/schemas/{id}\ - Delete schema

---

##  Authentication & OIDC Endpoints

### OIDC Integration
- \GET /oidc/authorize\ - OIDC authorization endpoint
- \POST /oidc/callback\ - OIDC callback handler
- \POST /oidc/token\ - OIDC token endpoint
- \POST /oidc/verify\ - Verify OIDC token
- \GET /oidc/.well-known/openid_configuration\ - OIDC configuration
- \GET /oidc/.well-known/jwks.json\ - JSON Web Key Set
- \GET /oidc/userinfo\ - User info endpoint

---

##  User Profile & Management Endpoints

### Profile Management
- \GET /profile\ - Get current user profile
- \GET /profile/{userId}\ - Get specific user profile
- \PUT /profile\ - Update user profile

### Avatar Management
- \POST /profile/avatar\ - Upload avatar (multipart/form-data)
- \GET /profile/avatar\ - Get avatar URL
- \DELETE /profile/avatar\ - Delete avatar

### Security & Authentication
- \POST /profile/change-password\ - Change password
- \POST /profile/delete-account\ - Delete account

### Profile Analytics
- \GET /profile/stats\ - Get profile statistics
- \GET /profile/export\ - Export user data (JSON/CSV)

---

##  Audit & Monitoring Endpoints

### Audit Logs
- \GET /audit/logs\ - Get audit logs with filtering
- \POST /audit/logs/search\ - Search audit logs
- \GET /audit/logs/export\ - Export audit logs

### Audit Analytics
- \GET /audit/stats\ - Get audit statistics
- \GET /audit/metrics\ - Get audit metrics

---

##  Verifiable Presentations Endpoints

### Presentation Management
- \POST /presentations\ - Create verifiable presentation
- \GET /presentations\ - List user presentations
- \GET /presentations/{id}\ - Get presentation details
- \DELETE /presentations/{id}\ - Delete presentation

### Presentation Verification
- \POST /presentations/verify\ - Verify presentation

---

##  Data Export/Import Endpoints

### Wallet Data
- \GET /export/wallet\ - Export complete wallet data
- \POST /import/wallet\ - Import wallet data

### Credentials Export
- \GET /export/credentials\ - Export credentials
- \POST /export/credentials/batch\ - Batch export credentials

### Backup & Recovery
- \POST /backup/create\ - Create wallet backup
- \GET /backup/list\ - List available backups
- \POST /backup/restore\ - Restore from backup
- \DELETE /backup/{id}\ - Delete backup

---

##  Real-time Notifications Endpoints

### Notification Management
- \GET /notifications\ - Get user notifications
- \GET /notifications/{id}\ - Get notification details
- \PUT /notifications/{id}/read\ - Mark notification as read
- \PUT /notifications/{id}/unread\ - Mark notification as unread
- \DELETE /notifications/{id}\ - Delete notification
- \PUT /notifications/mark-all-read\ - Mark all notifications as read
- \DELETE /notifications\ - Delete all notifications

### Notification Preferences
- \GET /notifications/preferences\ - Get notification preferences
- \PUT /notifications/preferences\ - Update notification preferences

### Notification Analytics
- \GET /notifications/stats\ - Get notification statistics

### WebSocket Connection
- \GET /ws/notifications\ - WebSocket endpoint for real-time notifications

---

##  Request/Response Formats

### Standard Query Parameters
- \limit\ - Number of results to return (default: 50)
- \offset\ - Pagination offset (default: 0)
- \sort\ - Sort field
- \order\ - Sort order (asc/desc)
- \search\ - Search query
- \ilter\ - Filter parameters
- \startDate\ - Start date for filtering
- \ndDate\ - End date for filtering

### Standard Response Format
\\\json
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
\\\

### Authentication Headers
\\\
Authorization: Bearer <access_token>
Content-Type: application/json
X-API-Key: <api_key>
\\\

### File Upload Headers
\\\
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
\\\

---

##  Error Handling

### Standard Error Response
\\\json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "...",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "status": "error"
}
\\\

### Common HTTP Status Codes
- \200\ - Success
- \201\ - Created
- \204\ - No Content
- \400\ - Bad Request
- \401\ - Unauthorized
- \403\ - Forbidden
- \404\ - Not Found
- \409\ - Conflict
- \422\ - Unprocessable Entity
- \429\ - Too Many Requests
- \500\ - Internal Server Error
- \501\ - Not Implemented

### Graceful Degradation
The API client includes fallback mechanisms for:
- Mock DID resolution when backend is unavailable
- Mock profile data for development
- Default preferences and settings

---

##  Integration Details

### WebSocket Events
- \
otification.new\ - New notification received
- \credential.updated\ - Credential status changed
- \connection.updated\ - Connection status changed
- \presentation.verified\ - Presentation verification completed

### Batch Operations Support
- Bulk credential verification
- Bulk credential revocation
- Batch export operations
- Bulk notification management

### Pagination Support
All list endpoints support pagination with:
- \limit\ and \offset\ parameters
- \	otal\ count in response metadata
- \hasMore\ flag for infinite scroll

### File Upload Support
- Multipart form data for avatar uploads
- JSON and CSV export formats
- Wallet backup/restore functionality

---

##  Implementation Notes

### Current Base URL
\\\
Production: https://didbockchain-380915310329.europe-west1.run.app
Development: http://localhost:3000
\\\

### Request Timeout
- Default timeout: 30 seconds
- Configurable via API_CONFIG.timeout

### Data Formats
- JSON for all API responses
- JWT for credentials and presentations
- Multipart/form-data for file uploads

### Encoding
- URL encoding for DID parameters
- Base64 encoding for binary data where needed

This API documentation reflects the actual implementation in the DID Blockchain application, including all implemented endpoints, data formats, and integration details.
