# BlockChain

A comprehensive blockchain-based identity and credential management platform built with modern web technologies.

## 🌟 Overview

This project is a full-featured blockchain application designed for Women's Day Blockchain Development, providing secure identity management, credential verification, and decentralized connection capabilities.

## ✨ Features

- **🔐 Identity Management**: Secure digital identity creation and management
- **📜 Credential System**: Issue, verify, and manage blockchain-based credentials
- **🤝 Connection Network**: Build and manage professional connections on the blockchain
- **📊 Dashboard**: Comprehensive analytics and overview of your blockchain activities
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **⚡ Real-time Updates**: Live notifications and updates across the platform
- **🔒 Security First**: Built with security best practices and blockchain standards

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

## 📱 Pages & Features

### Core Application Pages

#### 🏠 **Landing Page** (`/`)
- **Welcome Interface**: Professional landing page with project introduction
- **Call-to-Action**: "Create Wallet" and "Import Wallet" buttons
- **Feature Showcase**: Three key features (Secure & Private, Interoperable, You Own It)
- **Responsive Design**: Mobile-friendly layout with gradient background

#### 📊 **Dashboard** (`/dashboard`)
- **Identity Overview**: Primary and anonymous DID display with verification status
- **Recent Activity Feed**: Timeline of credential issuances, verifications, and identity creations
- **Quick Stats**: Total credentials (5) and connections (12) with direct navigation links
- **Real-time Notifications**: Bell icon with notification count
- **Activity History**: Last used timestamps and interaction tracking

#### 🆔 **Identity Management** (`/identities`)
- **Multi-DID Support**: Create and manage multiple decentralized identities
- **DID Methods**: Support for `did:web`, `did:key`, and `did:ion` methods
- **Identity Types**: Primary and secondary identity classification
- **Status Tracking**: Verified, pending, and error states with visual indicators
- **Usage Analytics**: Track identity usage count and last interaction
- **Bulk Operations**: Copy DID, view details, share, and delete identities
- **Domain Integration**: `did:web` identities tied to domain ownership

#### 🎓 **Credentials** (`/credentials`)
- **Comprehensive Credential Management**: View, filter, and search across all credentials
- **Credential Types**: Educational, Professional, Government ID, Licenses, Health certificates
- **Advanced Filtering**: By status (verified, expiring, expired, pending), issuer, and search terms
- **Dual View Modes**: Grid and list views for different preferences
- **Request System**: QR code scanning or URL-based credential requests
- **Sharing Capabilities**: Share individual credentials or export as JSON
- **Status Management**: Real-time credential status with expiration alerts
- **Detailed View**: Full credential information with field-by-field breakdown

#### 🔗 **Connections** (`/connections`)
- **Trust Network**: Manage relationships with issuers and verifiers
- **Connection Types**: Issuer, Verifier, and Both (hybrid) classifications
- **Trust Levels**: High, Medium, and Low trust with visual indicators
- **Status Management**: Active, Pending, and Blocked connection states
- **Permission System**: Granular permissions for credential issuance and verification
- **Activity Tracking**: Connection date, last interaction, and usage statistics
- **QR Code Integration**: Scan QR codes to add new connections
- **Bulk Operations**: Accept, reject, block, and unblock connections

#### 📄 **Presentations** (`/presentations`)
- **Selective Disclosure**: Create presentations with specific credential fields
- **Expiration Control**: Set time limits for presentation validity
- **Recipient Management**: Specify who can access the presentation
- **Status Tracking**: Active, expired, and revoked presentation states
- **Field Selection**: Choose which credential fields to include
- **Sharing Options**: Direct sharing and export capabilities
- **Activity History**: Track presentation creation and usage

#### 👤 **Profile** (`/profile`)
- **Personal Information**: Name, email, and bio management
- **DID Display**: Read-only display of primary and anonymous DIDs
- **Profile Updates**: Real-time profile editing with save functionality
- **Identity Integration**: Automatic DID association with profile

#### ⚙️ **Settings** (`/settings`)
- **Multi-Tab Interface**: Security, Privacy, Developer, and General settings
- **Security Features**:
  - Backup & Recovery with passphrase generation
  - Key rotation scheduling
  - Biometric authentication
  - Auto-lock timers
- **Privacy Controls**:
  - Sharing preferences (selective, minimal, full disclosure)
  - Data retention settings
  - Usage analytics opt-out
  - Privacy tools and activity clearing
- **Developer Options**:
  - Debug mode toggle
  - Network mode selection (mainnet/testnet/local)
  - API configuration
  - Data export functionality
- **General Settings**:
  - Dark/light theme toggle
  - About section with version information

#### 🚀 **Onboarding** (`/onboarding`)
- **Multi-Step Process**: Guided wallet setup in two main steps
- **Passphrase Generation**: Secure 12-word recovery passphrase creation
- **Biometric Setup**: Optional fingerprint/face recognition configuration
- **Security Education**: Built-in warnings about passphrase storage
- **Seamless Flow**: Automatic redirection to dashboard upon completion

### Advanced Features

#### 🔐 **Security & Privacy**
- **Multi-Layer Security**: Passphrase, biometrics, and auto-lock features
- **Selective Disclosure**: Share only necessary credential information
- **Trust Management**: Granular trust levels for all connections
- **Activity Monitoring**: Comprehensive logging and privacy controls

#### 📱 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Consistent header with user info and notifications
- **Modal Interfaces**: Clean popups for detailed actions and forms
- **Real-time Feedback**: Immediate status updates and validation messages

#### 🔗 **Integration Capabilities**
- **DID Methods**: Support for web, key, and ion decentralized identifiers
- **QR Code Scanning**: Fast connection and credential request setup
- **URL Integration**: Direct service connection via URLs or DIDs
- **Export Functionality**: JSON export for data portability

#### 📊 **Analytics & Monitoring**
- **Usage Statistics**: Track identity usage, connection activity, and credential interactions
- **Status Dashboards**: Visual indicators for all system components
- **Activity Feeds**: Chronological activity tracking across all features
- **Performance Metrics**: Connection counts, trust levels, and system health

## 🏗 Project Structure

```
BlockChain/
├── components/
│   ├── layout/          # Layout components
│   └── ui/             # Reusable UI components (40+ Radix UI components)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages and API routes
│   ├── _app.tsx        # App component
│   ├── index.tsx       # Home page
│   ├── dashboard.tsx   # Main dashboard
│   ├── identities.tsx  # Identity management
│   ├── credentials.tsx # Credential system
│   ├── connections.tsx # Connection network
│   └── ...
├── public/             # Static assets
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## 🎨 UI Components

This project includes 40+ pre-built UI components from Radix UI:
- Accordions, Alerts, Avatars
- Buttons, Badges, Breadcrumbs
- Calendars, Cards, Carousels
- Dialogs, Dropdowns, Forms
- Navigation, Popovers, Progress bars
- Selects, Sheets, Skeletons
- Sliders, Switches, Tables
- Tabs, Toasts, Tooltips
- And many more...

## 🔧 Configuration

### Next.js Configuration
- Located in `next.config.mjs`
- Configured for modern React features
- Optimized for production builds

### Tailwind CSS
- Custom design system
- Dark/Light theme support
- Responsive design utilities
- Custom animations and transitions

### TypeScript
- Strict type checking enabled
- Custom type definitions
- Full IntelliSense support

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
