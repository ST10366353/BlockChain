# Dual-Purpose DID Blockchain Wallet

A comprehensive decentralized identity platform serving both **enterprise-grade organizations** and **average consumers** through a secure handshake mechanism and comprehensive mock data system for development.

## 🌟 Overview

This innovative platform transforms traditional identity management by providing:

- **🔐 Enterprise Portal**: Advanced identity management for organizations
- **📱 Consumer App**: Simple, privacy-focused mobile experience  
- **🤝 Handshake Protocol**: Secure cross-ecosystem information exchange
- **⚡ Real-time Verification**: Instant credential validation
- **🔒 Zero-Knowledge Proofs**: Privacy-preserving data sharing
- **🧪 Mock Data System**: Complete development environment with no external dependencies

## ✨ Key Features

### Enterprise Features
- **Multi-DID Architecture**: Organizational and user-specific identities
- **Bulk Operations**: Efficient management of large user populations
- **Compliance Reporting**: Automated regulatory documentation
- **Audit Logging**: Complete activity tracking and monitoring
- **Trust Registry**: Verified issuer and partner management
- **Advanced Analytics**: Performance metrics and usage statistics

### Consumer Features
- **Mobile-First Design**: Intuitive smartphone interface
- **QR Code Integration**: Easy credential scanning and sharing
- **Selective Disclosure**: User-controlled data sharing
- **Privacy Controls**: Consent-based information exchange
- **Offline Capability**: Access credentials without internet
- **Biometric Authentication**: Fingerprint and face recognition

### Handshake Mechanism
- **Secure Communication**: Encrypted cross-ecosystem data exchange
- **Zero-Knowledge Proofs**: Prove information without revealing data
- **Consent Management**: User approval for all data sharing
- **Audit Trail**: Complete transaction history
- **Real-time Processing**: Instant verification and responses
- **Selective Disclosure**: Fine-grained data sharing control

### Development Features
- **Mock Data System**: Comprehensive mock API responses for all services
- **No External Dependencies**: Complete development without backend services
- **Real-time Simulation**: Network delays and realistic API behavior
- **Error Handling**: Graceful fallbacks and robust error management

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI (40+ components)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Themes**: next-themes for dark/light mode

### Key Dependencies
- React 19 & React DOM 19
- Node.js 22+
- TypeScript 5+
- PostCSS & Autoprefixer
- Date handling with date-fns
- Input OTP components
- Sonner for notifications

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A modern web browser

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BlockChain.git
   cd BlockChain
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 API Services & Functions

### Core API Client
- **APIClient**: Generic HTTP client with timeout and error handling
- **Mock Data System**: Automatic fallback to mock responses in development
- **Network Simulation**: Realistic delay simulation for development testing
- **Error Boundaries**: Graceful error handling and fallback responses

### DID Management (`did-api.ts`)
- `resolveDID(did: string)`: Resolve DID documents
- `registerDID(request: DIDRegistrationRequest)`: Register new DIDs
- `updateDID(did: string, updates: DIDUpdateRequest)`: Update DID documents
- `deleteDID(did: string)`: Deactivate DIDs
- `getDIDEvents(did: string)`: Get DID operation history
- `validateDIDFormat(did: string)`: Validate DID syntax
- `isDIDResolvable(did: string)`: Check DID availability
- `getSupportedMethods()`: Get supported DID methods

### Credentials Management (`credentials-api.ts`)
- `issueCredential(request: CredentialIssuanceRequest)`: Issue new credentials
- `verifyCredential(credential: VerifiableCredential)`: Verify credential authenticity
- `revokeCredential(credentialId: string)`: Revoke credentials
- `queryCredentials(params: CredentialQueryParams)`: Search and filter credentials
- `getCredentialById(id: string)`: Get specific credential details
- `getCredentialsBySubject(subjectDid: string)`: Get user's credentials
- `getCredentialsByIssuer(issuerDid: string)`: Get issuer's credentials
- `getRevocationStatus(credentialId: string)`: Check revocation status
- `batchVerifyCredentials(credentials[])`: Bulk verification
- `batchRevokeCredentials(credentials[])`: Bulk revocation
- `getCredentialTemplates()`: Get available templates
- `createCredentialTemplate()`: Create new templates
- `requestCredential()`: Request credentials from issuers

### Trust Registry (`trust-api.ts`)
- `getTrustedIssuers(params?)`: Get verified issuers
- `addTrustedIssuer(issuer: IssuerRegistrationRequest)`: Add trusted issuer
- `updateTrustedIssuer(did: string, updates)`: Update issuer details
- `removeTrustedIssuer(did: string)`: Remove trusted issuer
- `getIssuerDetails(did: string)`: Get detailed issuer information
- `updateIssuerTrustStatus(did: string, status)`: Update trust level
- `getCredentialSchemas()`: Get supported schemas
- `getTrustPolicies()`: Get trust policies
- `getVerificationPolicies()`: Get verification policies
- `isIssuerTrusted(did: string)`: Check issuer trust status
- `batchUpdateIssuerStatus()`: Bulk trust updates

### Profile Management (`profile-api.ts`)
- `getProfile()`: Get user profile
- `updateProfile(updates: ProfileUpdateRequest)`: Update profile
- `uploadAvatar(file: File)`: Upload profile picture
- `deleteAvatar()`: Remove profile picture
- `changePassword(request: PasswordChangeRequest)`: Change password
- `getProfileStats()`: Get profile statistics
- `exportProfileData()`: Export user data
- `updatePreferences()`: Update user preferences
- `updateSecurityPreferences()`: Update security settings
- `updateDisplayPreferences()`: Update display settings
- `enableTwoFactorAuth()`: Enable 2FA
- `disableTwoFactorAuth()`: Disable 2FA
- `getLoginHistory()`: Get login activity
- `getActiveSessions()`: Get active sessions
- `terminateSession(sessionId)`: End specific session

### Notifications System (`notifications-api.ts`)
- `getNotifications(query?)`: Get notifications with filtering
- `getNotificationById(id: string)`: Get specific notification
- `markAsRead(id: string)`: Mark notification as read
- `markAsUnread(id: string)`: Mark notification as unread
- `markAllAsRead()`: Mark all notifications as read
- `deleteNotification(id: string)`: Delete notification
- `deleteAllNotifications()`: Clear all notifications
- `getPreferences()`: Get notification preferences
- `updatePreferences()`: Update notification settings
- `getStats()`: Get notification statistics
- **WebSocket Support**: Real-time notification delivery
- **Polling Fallback**: Automatic fallback when WebSocket unavailable

### Audit & Monitoring (`audit-api.ts`)
- `getAuditLogs(params?)`: Get filtered audit logs
- `getAuditStats(params?)`: Get audit statistics
- `getSystemMetrics()`: Get system performance metrics
- `exportAuditLogs(params)`: Export audit data
- `getLogsForActor(actorDID)`: Get user-specific logs
- `getLogsForAction(action)`: Get action-specific logs
- `getFailedOperations()`: Get failed operations
- `getLogsInDateRange()`: Get logs within date range
- `getActivitySummary()`: Get dashboard activity summary
- `analyzeUserBehavior()`: Analyze user patterns
- `getPerformanceMetrics()`: Get performance over time

### OIDC Bridge (`oidc-api.ts`)
- `authorize(request: OIDCAuthorizationRequest)`: Start OIDC flow
- `exchangeCodeForToken()`: Exchange auth code for tokens
- `refreshToken(refreshToken: string)`: Refresh access tokens
- `verifyToken(token: string)`: Verify token validity
- `getProviderConfig()`: Get OIDC provider configuration
- `getJWKS()`: Get JSON Web Key Set
- `getUserInfo(accessToken: string)`: Get user information
- `completeLoginFlow()`: Complete full OIDC authentication

### Presentations (`presentations-api.ts`)
- `createPresentation()`: Create verifiable presentations
- `verifyPresentation()`: Verify presentation authenticity
- `getPresentationById(id)`: Get specific presentation
- `queryPresentations(params)`: Search presentations
- `updatePresentation()`: Update presentation details
- `deletePresentation()`: Delete presentation
- `getPresentationTemplates()`: Get available templates
- `createPresentationTemplate()`: Create new templates
- `requestSelectiveDisclosure()`: Request selective data sharing
- `generateZeroKnowledgeProof()`: Generate ZK proofs

### System Configuration (`system-api.ts`)
- `getConfig()`: Get system configuration
- `updateConfig()`: Update system settings
- `getFeatures()`: Get feature flags
- `updateFeature()`: Update feature flag
- `getRateLimitStatus()`: Get rate limiting status
- `resetRateLimits()`: Reset rate limits
- `getRequestMetrics()`: Get API request metrics
- `getErrorMetrics()`: Get error statistics
- `getPerformanceMetrics()`: Get performance metrics
- `getUsageMetrics()`: Get usage statistics
- `getStatus()`: Get system health status

### Search & Filtering (`search-api.ts`)
- `searchCredentials()`: Search across credentials
- `searchConnections()`: Search connections/issuers
- `searchPresentations()`: Search presentations
- `searchAuditLogs()`: Search audit logs
- `getCredentialFilters()`: Get available credential filters
- `getConnectionFilters()`: Get connection filters
- `getPresentationFilters()`: Get presentation filters

### Handshake Service (`handshake-service.ts`)
- `createHandshakeRequest()`: Initiate handshake between parties
- `respondToHandshakeRequest()`: Respond to handshake requests
- `getHandshakeRequests()`: Get pending/active requests
- `getHandshakeRequestById()`: Get specific request details
- `acceptHandshakeRequest()`: Accept handshake request
- `rejectHandshakeRequest()`: Reject handshake request
- `sendSelectiveDisclosure()`: Send selective data disclosure
- `sendZeroKnowledgeProof()`: Send ZK proof response
- `getConsentRecords()`: Get data sharing consent history
- `revokeConsent()`: Revoke previously given consent
- `getHandshakeStatus()`: Get handshake operation status

### Data Export/Import (`data-export-import.ts`)
- `exportWalletData()`: Export complete wallet
- `exportCredentials()`: Export credentials only
- `importWalletData()`: Import wallet from backup
- `validateImportData()`: Validate import file
- `getExportHistory()`: Get export history
- `scheduleBackup()`: Schedule automatic backups

## 📱 Pages & Routes

### Core Application Routes

#### 🏠 **Root & Landing**
- **`/`** - Smart routing based on user type (Consumer/Enterprise/Power-user)
- **`/landing`** - Professional landing page with feature showcase
- **`/login`** - Multi-method authentication (Passphrase, DID, Biometric)

#### 👤 **User Management**
- **`/onboarding`** - Multi-step wallet setup and configuration
- **`/profile`** - Comprehensive profile management with tabs:
  - Profile Information (Avatar, Name, Email, Bio)
  - Security Settings (2FA, Sessions, Login History)
  - Preferences (Notifications, Privacy, Display)
  - Statistics (Usage metrics, Account information)

#### 📊 **Consumer Dashboard (`/consumer/dashboard`)**
- **Real-time Statistics**: Credentials, Requests, Activity, DID Status
- **Recent Credentials Grid**: Visual credential management
- **Pending Requests**: Handshake request management
- **Quick Actions**: Add credentials, Scan QR, View requests, Settings
- **Notifications**: Live notification system with counts

#### 🏢 **Enterprise Dashboard (`/enterprise/dashboard`)**
- **Organization Overview**: Multi-user management
- **Bulk Operations**: Mass credential issuance and verification
- **Compliance Dashboard**: Regulatory reporting
- **Trust Registry Management**: Issuer and schema management
- **Advanced Analytics**: Performance metrics and insights

#### 🆔 **Identity Management (`/identities`)**
- **Multi-DID Support**: Create and manage multiple identities
- **DID Methods**: Support for `did:web`, `did:key`, and `did:ion`
- **Identity Classification**: Primary, secondary, anonymous identities
- **Status Tracking**: Verified, pending, error states with visual indicators
- **Usage Analytics**: Track identity usage and interaction history
- **Bulk Operations**: Copy, share, delete identities
- **Domain Integration**: `did:web` domain ownership verification

#### 🎓 **Credentials Management (`/credentials`)**
- **Comprehensive Management**: View, filter, search all credentials
- **Credential Types**: Educational, Professional, Government, Licenses, Health
- **Advanced Filtering**: Status, issuer, type, expiration filtering
- **Dual View Modes**: Grid and list layouts
- **Request System**: QR code scanning and URL-based requests
- **Sharing Capabilities**: Individual sharing and bulk export
- **Status Management**: Real-time status with expiration alerts
- **Detailed Views**: Field-by-field credential breakdown

#### 🔗 **Connections Management (`/connections`)**
- **Trust Network**: Comprehensive issuer and verifier management
- **Connection Types**: Issuer, Verifier, Both (hybrid)
- **Trust Levels**: High, Medium, Low with visual indicators
- **Status Management**: Active, Pending, Blocked states
- **Permission System**: Granular credential permissions
- **Activity Tracking**: Connection dates and usage statistics
- **QR Integration**: Scan-to-connect functionality
- **Bulk Operations**: Mass accept, reject, block operations

#### 📄 **Presentations (`/presentations`)**
- **Selective Disclosure**: Fine-grained field selection
- **Expiration Control**: Time-limited presentation validity
- **Recipient Management**: Specify authorized viewers
- **Status Tracking**: Active, expired, revoked states
- **Sharing Options**: Direct sharing and export capabilities
- **Activity History**: Track creation and usage
- **Template System**: Reusable presentation formats

#### ⚙️ **Settings (`/settings`)**
- **Multi-Tab Interface**: Security, Privacy, Developer, General
- **Security Features**:
  - Backup & Recovery with passphrase generation
  - Key rotation scheduling
  - Biometric authentication setup
  - Auto-lock timer configuration
- **Privacy Controls**:
  - Sharing preferences (selective, minimal, full)
  - Data retention policies
  - Analytics opt-out options
  - Privacy tools and data clearing
- **Developer Options**:
  - Debug mode toggle
  - Network selection (mainnet/testnet/local)
  - API configuration
  - Mock data toggle
  - Export functionality
- **General Settings**:
  - Theme selection (Dark/Light/System)
  - Language preferences
  - About and version information

#### 🔔 **Notifications (`/notifications`)**
- **Real-time Updates**: Live notification feed
- **Notification Types**: Credential events, Connection requests, Security alerts
- **Advanced Filtering**: Type, priority, read status filtering
- **Bulk Operations**: Mark all read, clear all notifications
- **WebSocket Support**: Real-time delivery with polling fallback
- **Notification Preferences**: Granular notification controls

#### 📊 **Audit Trail (`/audit-trail`)**
- **Comprehensive Logging**: All system activities and user actions
- **Advanced Filtering**: Date range, action type, actor filtering
- **Performance Metrics**: Response times and success rates
- **Export Capabilities**: CSV and JSON export options
- **User Behavior Analysis**: Usage patterns and statistics

## 🧩 Shared Components & Hooks

### Custom Hooks
- **`useUserType`**: User type detection and management (Consumer/Enterprise/Power-user)
- **`useToast`**: Toast notification system with multiple variants
- **`useApp`**: Global application state management
- **`useTheme`**: Theme switching and persistence
- **`useLoading`**: Global loading state management
- **`useError`**: Centralized error handling
- **`useOnlineStatus`**: Network connectivity detection
- **`useDeviceType`**: Device type detection for responsive design

### UI Components (40+ Radix UI Components)
- **Layout**: Cards, Grids, Containers, Headers
- **Forms**: Inputs, Selects, Checkboxes, Radios, Textareas
- **Navigation**: Breadcrumbs, Tabs, Pagination, Menus
- **Feedback**: Alerts, Toasts, Progress bars, Skeletons
- **Overlays**: Modals, Popovers, Tooltips, Sheets
- **Data Display**: Tables, Avatars, Badges, Charts
- **Interactive**: Buttons, Switches, Sliders, Calendars

### Specialized Components
- **`CredentialCard`**: Individual credential display and actions
- **`CredentialGrid`**: Grid layout for multiple credentials
- **`QRCodeScanner`**: QR code scanning functionality
- **`HandshakeRequestModal`**: Handshake request management
- **`CredentialDetailsModal`**: Detailed credential view
- **`ShareCredentialModal`**: Credential sharing interface
- **`LoadingSpinner`**: Consistent loading indicators
- **`ErrorBoundary`**: Error boundary with graceful fallbacks

## 🔐 Security & Privacy Features

### Authentication Methods
- **Passphrase Recovery**: 12-word mnemonic phrase system
- **DID Authentication**: Decentralized identifier-based login
- **Biometric Authentication**: Fingerprint and face recognition
- **Multi-Factor Authentication**: 2FA with TOTP support
- **Session Management**: Active session monitoring and control

### Privacy Controls
- **Selective Disclosure**: User-controlled data sharing
- **Zero-Knowledge Proofs**: Prove claims without revealing data
- **Anonymous Identities**: `did:key` based anonymous interactions
- **Data Minimization**: Share only necessary information
- **Consent Management**: Granular permission controls
- **Right to be Forgotten**: Data deletion and revocation

### Security Features
- **Auto-lock**: Configurable automatic screen locking
- **Key Rotation**: Scheduled cryptographic key updates
- **Rate Limiting**: API request rate limiting and monitoring
- **Audit Logging**: Comprehensive activity tracking
- **Secure Storage**: Encrypted local storage for sensitive data
- **HTTPS Only**: Secure communication protocols

## 🔗 Integration Capabilities

### DID Methods Support
- **`did:web`**: Web-based DIDs with domain verification
- **`did:key`**: Cryptographic key-based DIDs for anonymity
- **`did:ion`**: ION network DIDs for decentralized resolution

### Standards Compliance
- **W3C Verifiable Credentials**: Full VC data model support
- **W3C Verifiable Presentations**: VP specification compliance
- **DID Core Specification**: Complete DID document support
- **OIDC Bridge**: OpenID Connect integration for legacy systems

### External Integrations
- **QR Code Support**: Credential and connection QR codes
- **WebSocket**: Real-time communication support
- **WebAuthn**: Web Authentication API for biometrics
- **File Export/Import**: JSON and CSV data portability

## 🏗 Project Structure

```
BlockChain/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   └── ui/              # 40+ Radix UI components
│   ├── shared/              # Shared utilities and components
│   │   ├── components/      # Shared UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── pages/               # Next.js pages and routing
│   │   ├── api/             # API routes
│   │   ├── consumer/        # Consumer-specific pages
│   │   └── enterprise/      # Enterprise-specific pages
│   ├── services/            # API service layer
│   │   ├── api-client.ts    # Core HTTP client
│   │   ├── mock-data.ts     # Mock data definitions
│   │   ├── *-api.ts         # Individual service APIs
│   │   └── index.ts         # Service exports
│   ├── handshake/           # Handshake protocol implementation
│   │   ├── protocol/        # Core handshake logic
│   │   ├── services/        # Handshake services
│   │   └── components/      # Handshake UI components
│   ├── contexts/            # Legacy React contexts
│   ├── hooks/               # Legacy custom hooks
│   └── lib/                 # Utility libraries
├── public/                  # Static assets
├── styles/                  # Global CSS styles
└── tests/                   # Test files
```

## 🎨 UI & Design System

### Theme System
- **Dark/Light Mode**: Automatic and manual theme switching
- **System Theme**: Respects user's OS preference
- **Consistent Colors**: Unified color palette across components
- **Typography Scale**: Hierarchical text sizing system

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhanced**: Full-featured desktop experience
- **Breakpoint System**: Consistent responsive breakpoints

### Component Library
- **Design Tokens**: Consistent spacing, colors, typography
- **Icon System**: Lucide React icon library
- **Animation System**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliance with keyboard navigation

## 🚀 Development Features

### Mock Data System
- **Complete API Simulation**: No backend required for development
- **Realistic Data**: Meaningful mock data for all endpoints
- **Network Simulation**: Configurable delay simulation
- **Error Simulation**: Test error handling with mock failures
- **Development Toggle**: Easy switching between mock and real APIs

### Development Tools
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Hot Reload**: Instant development feedback
- **Error Boundaries**: Graceful error handling in development
- **Debug Mode**: Enhanced logging and development features

### Testing Support
- **Component Testing**: React component test framework
- **API Testing**: Mock API response testing
- **Integration Testing**: End-to-end workflow testing
- **Accessibility Testing**: Automated accessibility checks

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development|production
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_WS_URL=wss://your-websocket-url.com
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=mainnet|testnet|local
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://your-rpc-url.com
```

### API Configuration
- **Base URL**: Configurable API endpoint
- **Timeout**: Request timeout configuration
- **Rate Limiting**: Request throttling configuration
- **Mock Mode**: Development mock data toggle
- **Retry Logic**: Failed request retry configuration

### Feature Flags
- **OIDC Bridge**: Enable/disable OIDC integration
- **Selective Disclosure**: Toggle selective disclosure features
- **WebAuthn**: Enable/disable biometric authentication
- **Batch Operations**: Toggle bulk operation features
- **Real-time Notifications**: Enable/disable WebSocket notifications

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure mock data compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Women's Day Blockchain Development** initiative
- **Radix UI** for the excellent component library
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for hosting and deployment platform

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation
- Reach out to the development team

---

**Built with ❤️ for Women's Day Blockchain Development**
