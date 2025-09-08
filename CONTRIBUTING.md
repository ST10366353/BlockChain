# 🤝 Contributing to IdentityVault

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/yourusername/identityvault/pulls)
[![Contributors](https://img.shields.io/github/contributors/yourusername/identityvault.svg)](https://github.com/yourusername/identityvault/graphs/contributors)
[![GitHub](https://img.shields.io/github/license/yourusername/identityvault.svg)](https://github.com/yourusername/identityvault/blob/main/LICENSE)

> Guidelines for contributing to IdentityVault - a secure, decentralized identity wallet.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security Considerations](#security-considerations)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Inclusive**: Welcome contributors from all backgrounds and skill levels
- **Be Collaborative**: Work together to achieve project goals
- **Be Responsible**: Take ownership of your contributions and their impact
- **Follow Guidelines**: Adhere to the contribution guidelines and coding standards

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: Version 2.30 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Local Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/identityvault.git
cd identityvault

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

### Project Structure Overview

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── forms/          # Form components and utilities
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and API clients
├── pages/              # Page components and routing
├── shared/             # Shared types and constants
├── stores/             # Zustand state management
└── worker/             # Cloudflare Worker API
```

## 🔄 Development Workflow

### 1. Choose an Issue

- Check the [Issues](https://github.com/yourusername/identityvault/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Create and switch to a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Development Process

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when implemented)
npm run test
```

### 4. Commit Changes

Follow conventional commit format:

```bash
# For features
git commit -m "feat: add biometric authentication support"

# For bug fixes
git commit -m "fix: resolve QR code scanning on iOS devices"

# For documentation
git commit -m "docs: update API documentation for v2.0"

# For refactoring
git commit -m "refactor: optimize credential validation logic"
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# Follow the PR template and include:
# - Description of changes
# - Screenshots (if UI changes)
# - Testing instructions
# - Related issues
```

## 💻 Coding Standards

### TypeScript Guidelines

- **Strict Mode**: All TypeScript strict checks enabled
- **Type Safety**: Avoid `any` types; use proper type definitions
- **Interface vs Type**: Use interfaces for object shapes, types for unions

```typescript
// ✅ Good: Specific types
interface User {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'consumer' | 'enterprise' | 'power-user';

// ❌ Bad: Using any
function processData(data: any) {
  // ...
}
```

### React Best Practices

- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Error Boundaries**: Implement error boundaries for robustness
- **Performance**: Use `React.memo`, `useMemo`, and `useCallback` appropriately

```typescript
// ✅ Good: Custom hook for data fetching
function useCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/credentials');
      setCredentials(response.data);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return { credentials, loading, refetch: fetchCredentials };
}
```

### File and Folder Naming

- **Components**: PascalCase (e.g., `CredentialCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCredentials.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with descriptive names (e.g., `CredentialType.ts`)
- **Folders**: kebab-case (e.g., `credential-management/`)

### Code Formatting

This project uses ESLint and Prettier for code formatting:

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    // Project-specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-instrument': 'off'
  }
};
```

## 🧪 Testing Guidelines

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions and API calls
- **E2E Tests**: Test complete user workflows

### Testing Tools

- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright (planned)
- **Coverage**: Minimum 80% coverage required

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CredentialCard } from './CredentialCard';

describe('CredentialCard', () => {
  const mockCredential = {
    id: 'cred_123',
    name: 'University Degree',
    type: 'Educational',
    issuer: 'MIT University',
    status: 'active'
  };

  it('renders credential information correctly', () => {
    render(<CredentialCard credential={mockCredential} />);

    expect(screen.getByText('University Degree')).toBeInTheDocument();
    expect(screen.getByText('MIT University')).toBeInTheDocument();
    expect(screen.getByText('Educational')).toBeInTheDocument();
  });

  it('handles credential actions', async () => {
    const mockOnEdit = jest.fn();
    render(
      <CredentialCard
        credential={mockCredential}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockCredential);
    });
  });
});
```

### Test Coverage Requirements

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 85%
- **Lines**: ≥ 80%

## 🔄 Pull Request Process

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have added tests for new functionality
- [ ] I have updated documentation
- [ ] My changes are backward compatible
- [ ] I have tested my changes thoroughly

## Screenshots (if applicable)
Add screenshots of UI changes.

## Related Issues
Fixes #123, Addresses #456
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs linting, type checking, and tests
2. **Peer Review**: At least one maintainer reviews the code
3. **Security Review**: Security team reviews for security implications
4. **Merge**: After approval, maintainer merges the PR

### Review Guidelines

#### For Reviewers
- **Be Constructive**: Focus on code quality and best practices
- **Be Specific**: Provide clear, actionable feedback
- **Be Timely**: Review within 2-3 business days
- **Be Encouraging**: Acknowledge good work and improvements

#### For Contributors
- **Address Feedback**: Respond to all review comments
- **Explain Decisions**: Provide context for design decisions
- **Request Help**: Ask for clarification if needed
- **Iterate Quickly**: Make requested changes promptly

## 🔒 Security Considerations

### Security Checklist

- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Authentication**: Proper authentication for sensitive operations
- [ ] **Authorization**: Role-based access controls implemented
- [ ] **Data Protection**: Sensitive data properly encrypted
- [ ] **Error Handling**: No sensitive information in error messages
- [ ] **Dependencies**: No known security vulnerabilities in dependencies
- [ ] **Secrets**: No secrets or credentials in code
- [ ] **Logging**: Sensitive data not logged inappropriately

### Security Testing

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm run security-audit

# Run SAST (Static Application Security Testing)
npm run sast
```

### Reporting Security Issues

See [SECURITY.md](SECURITY.md) for security reporting guidelines.

## 📚 Documentation

### Documentation Standards

- **README**: Comprehensive project overview and setup instructions
- **API Docs**: Detailed endpoint documentation with examples
- **Code Comments**: JSDoc comments for functions and complex logic
- **Inline Comments**: Explain non-obvious code decisions

### Documentation Updates

When making changes, update documentation:

```typescript
/**
 * Authenticates a user with the provided credentials
 * @param credentials - User login credentials
 * @returns Promise resolving to authentication result
 * @throws {AuthenticationError} When authentication fails
 */
async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  // Implementation
}
```

### API Documentation

Use OpenAPI/Swagger for API documentation:

```yaml
paths:
  /api/auth/login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
```

## 🎯 Development Best Practices

### Performance Optimization

- **Bundle Splitting**: Use dynamic imports for code splitting
- **Image Optimization**: Compress and lazy load images
- **Caching**: Implement appropriate caching strategies
- **Memoization**: Use React.memo and useMemo appropriately

### Accessibility

- **WCAG 2.1 AA**: Meet accessibility standards
- **Semantic HTML**: Use proper semantic elements
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Readers**: Test with screen reader software

### Internationalization

- **i18n Ready**: Design components for internationalization
- **Locale Support**: Support multiple languages and locales
- **Date/Time**: Use Intl API for date and time formatting
- **Number Formatting**: Use Intl.NumberFormat for numbers

## 🏆 Recognition

Contributors are recognized in several ways:

- **Contributors List**: Added to repository contributors
- **Changelog**: Mentioned in release changelogs
- **Hall of Fame**: Featured contributors page
- **Swag**: Contributor merchandise for significant contributions

## 📞 Support

- **Discussions**: [GitHub Discussions](https://github.com/yourusername/identityvault/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/identityvault/issues)
- **Discord**: [Community Discord](https://discord.gg/identityvault)
- **Documentation**: [Developer Docs](https://docs.identityvault.com)

## 🙏 Acknowledgments

Thank you to all contributors who help make IdentityVault better:

- [List of major contributors]
- [Community members]
- [Security researchers]

---

**Contributing Guidelines Version:** 1.0.0
**Last Updated:** December 2023
