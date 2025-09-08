# IdentityVault

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://cloudflare.com/)

> A comprehensive, production-ready decentralized identity wallet built with modern web technologies. Securely manage, share, and verify digital credentials with enterprise-grade security and privacy features.

## 🌟 Features

### 🔐 Advanced Authentication System
- **Multi-Method Authentication**
  - Passphrase-based authentication with 12-word recovery phrases
  - Decentralized Identifier (DID) authentication via OIDC flow
  - Biometric authentication (fingerprint, Face ID, WebAuthn)
  - Hardware security key support

- **Enterprise Security**
  - JWT token management with automatic refresh
  - Role-based access control (Consumer, Enterprise, Power User)
  - Session persistence with secure local storage
  - Automatic logout on token expiration

### 📱 QR Code Ecosystem
- **QR Code Generation**
  - Real-time QR code generation from any data type
  - Customizable size and error correction levels
  - Download QR codes as PNG images
  - Native sharing capabilities

- **QR Code Scanning**
  - Real-time camera integration with ZXing library
  - Intelligent QR code parsing and validation
  - Support for multiple formats (URLs, DIDs, credentials, JSON)
  - Context-aware actions based on QR content

### 🏢 Credential Management
- **Comprehensive Credential Operations**
  - Create, read, update, and delete digital credentials
  - Bulk operations for enterprise users
  - Import credentials from external sources
  - Export credentials in multiple formats (JSON, JWT, QR)

- **Advanced Sharing & Verification**
  - Secure credential sharing with expiration controls
  - Verifiable credential verification
  - Selective disclosure capabilities
  - Audit trails for all credential operations

### 📊 Enterprise Features
- **Dashboard & Analytics**
  - Real-time credential statistics
  - Usage analytics and reporting
  - Compliance monitoring dashboard
  - Performance metrics and insights

- **Team Management**
  - Bulk user operations
  - Role-based permissions
  - Audit trails and compliance logging
  - Enterprise policy enforcement

### 🔄 Real-time Capabilities
- **Live Updates**
  - Real-time credential status updates
  - Live handshake request notifications
  - Instant synchronization across devices
  - Push notification support

### 📱 Offline Support
- **Offline-First Architecture**
  - Local credential storage and management
  - Offline queue for failed operations
  - Automatic synchronization when online
  - Network status detection and handling

### 🎨 User Experience
- **Modern UI/UX**
  - Responsive design for all devices
  - Dark/light theme support
  - Loading states and skeleton components
  - Smooth animations and transitions

- **Accessibility & Internationalization**
  - WCAG 2.1 AA compliance
  - Multi-language support foundation
  - Keyboard navigation support
  - Screen reader compatibility

## 🛡️ Security

### 🔒 Authentication & Authorization
- **Multi-Factor Authentication (MFA)**
  - Biometric authentication with WebAuthn
  - Hardware security key support
  - Time-based one-time passwords (TOTP)

- **Session Security**
  - JWT tokens with automatic refresh
  - Secure token storage in HTTP-only cookies
  - Session timeout and automatic logout
  - Cross-site request forgery (CSRF) protection

### 🔐 Data Protection
- **Encryption Standards**
  - AES-256-GCM encryption for data at rest
  - TLS 1.3 for data in transit
  - End-to-end encryption for sensitive operations
  - Secure key derivation functions (PBKDF2, Argon2)

- **Privacy by Design**
  - Zero-knowledge proofs for credential verification
  - Selective disclosure of credential attributes
  - Minimal data collection principles
  - GDPR and CCPA compliance features

### 🏢 Enterprise Security
- **Compliance & Audit**
  - SOC 2 Type II compliance framework
  - Comprehensive audit logging
  - Data retention policies
  - Regular security assessments

- **Access Control**
  - Role-based access control (RBAC)
  - Attribute-based access control (ABAC)
  - Multi-tenant architecture
  - Fine-grained permission management

### 🌐 Network Security
- **API Security**
  - Rate limiting and DDoS protection
  - Input validation and sanitization
  - SQL injection prevention
  - Cross-site scripting (XSS) protection

- **Infrastructure Security**
  - Cloudflare Workers for edge computing
  - Web Application Firewall (WAF)
  - Distributed Denial of Service (DDoS) mitigation
  - Regular security updates and patches

### 🔍 Security Monitoring
- **Real-time Monitoring**
  - Security event logging and alerting
  - Anomaly detection and threat intelligence
  - Automated incident response
  - Security information and event management (SIEM)

- **Vulnerability Management**
  - Regular security assessments
  - Automated dependency scanning
  - Penetration testing
  - Bug bounty program

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with WebAuthn support
- Camera access for QR scanning (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/identityvault.git
cd identityvault

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.identityvault.com
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── forms/          # Form components and utilities
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...
├── contexts/           # React context providers
│   ├── AuthContext.tsx # Authentication context
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── api/            # API client and services
│   ├── qr-parser.ts    # QR code parsing utilities
│   └── utils.ts        # General utilities
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Authentication page
│   └── ...
├── shared/             # Shared types and constants
│   └── types.ts        # TypeScript type definitions
├── stores/             # State management (Zustand)
│   ├── app-store.ts    # Main application store
│   ├── offline-store.ts # Offline functionality store
│   └── ...
└── worker/             # Cloudflare Worker API
    └── index.ts        # Worker entry point
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking

# Cloudflare Workers
npm run cf-typegen      # Generate Cloudflare types
npm run deploy          # Deploy to Cloudflare

# Testing (when implemented)
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate test coverage
```

### Code Quality

This project follows strict code quality standards:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates
- **Commitlint**: Conventional commit messages

## 🔧 Architecture

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Backend**: Cloudflare Workers, Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with refresh tokens
- **QR Codes**: qrcode.js, ZXing library

### Design Patterns

- **Container/Presentational Components**: Separation of concerns
- **Custom Hooks**: Reusable logic extraction
- **Context API**: Global state management
- **Compound Components**: Flexible component APIs
- **Render Props**: Component composition patterns

## 📚 API Documentation

### Authentication Endpoints

```typescript
// Login with different methods
POST /api/auth/login/passphrase
POST /api/auth/login/did
POST /api/auth/login/biometric

// Token management
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Credential Endpoints

```typescript
// CRUD operations
GET    /api/credentials
POST   /api/credentials
GET    /api/credentials/:id
PUT    /api/credentials/:id
DELETE /api/credentials/:id

// Advanced operations
POST   /api/credentials/import
POST   /api/credentials/bulk/export
POST   /api/credentials/:id/verify
POST   /api/credentials/:id/share
```

### Handshake Endpoints

```typescript
// Request management
GET    /api/handshake/requests
POST   /api/handshake/requests
POST   /api/handshake/requests/:id/respond
DELETE /api/handshake/requests/:id

// QR operations
POST   /api/handshake/qr/generate
POST   /api/handshake/qr/verify
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

### Code Standards

- Follow the existing code style
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Documentation**: [docs.identityvault.com](https://docs.identityvault.com)
- **Community**: [Discord](https://discord.gg/identityvault)
- **Issues**: [GitHub Issues](https://github.com/yourusername/identityvault/issues)
- **Email**: support@identityvault.com

## 🏆 Acknowledgments

- React and TypeScript communities
- Cloudflare Workers team
- Open source contributors
- Security researchers and auditors

---

**Built with ❤️ for the decentralized identity future**
