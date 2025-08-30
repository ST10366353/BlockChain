import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QRCodeGenerator, useQRCodeGenerator, createCredentialQR, createConnectionQR } from '@/components/qr-code-generator'

// Mock QRCode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
  toCanvas: jest.fn(),
  toString: jest.fn(),
}))

describe('QR Code Generator', () => {
  describe('createCredentialQR', () => {
    it('should create credential QR data', () => {
      const qrData = createCredentialQR(
        'cred-123',
        'University Degree',
        'Bachelor of Science in Computer Science'
      )

      expect(qrData).toEqual({
        type: 'credential',
        id: 'cred-123',
        name: 'University Degree',
        description: 'Bachelor of Science in Computer Science',
        timestamp: expect.any(String),
      })
    })

    it('should handle empty description', () => {
      const qrData = createCredentialQR('cred-123', 'University Degree')

      expect(qrData.description).toBe('Share credential via QR code')
    })
  })

  describe('createConnectionQR', () => {
    it('should create connection QR data', () => {
      const qrData = createConnectionQR(
        'did:web:alice.com',
        'Alice Johnson',
        'Professional connection request'
      )

      expect(qrData).toEqual({
        type: 'connection',
        did: 'did:web:alice.com',
        name: 'Alice Johnson',
        description: 'Professional connection request',
        timestamp: expect.any(String),
      })
    })

    it('should handle empty description', () => {
      const qrData = createConnectionQR('did:web:alice.com', 'Alice Johnson')

      expect(qrData.description).toBe('Share connection via QR code')
    })
  })

  describe('useQRCodeGenerator', () => {
    it('should initialize with correct state', () => {
      const TestComponent = () => {
        const qrGenerator = useQRCodeGenerator()
        return (
          <div>
            <div data-testid="is-open">{qrGenerator.isOpen.toString()}</div>
            <div data-testid="qr-data">{qrGenerator.qrData || 'null'}</div>
            <div data-testid="qr-url">{qrGenerator.qrUrl || 'null'}</div>
            <div data-testid="error">{qrGenerator.error || 'null'}</div>
          </div>
        )
      }

      render(<TestComponent />)

      expect(screen.getByTestId('is-open')).toHaveTextContent('false')
      expect(screen.getByTestId('qr-data')).toHaveTextContent('null')
      expect(screen.getByTestId('qr-url')).toHaveTextContent('null')
      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })

    it('should generate QR code successfully', async () => {
      const TestComponent = () => {
        const qrGenerator = useQRCodeGenerator()

        const handleGenerate = () => {
          const qrData = createCredentialQR('cred-123', 'Test Credential')
          qrGenerator.generateQRCode(qrData)
        }

        return (
          <div>
            <button onClick={handleGenerate}>Generate QR</button>
            <div data-testid="is-open">{qrGenerator.isOpen.toString()}</div>
            <div data-testid="qr-url">{qrGenerator.qrUrl || 'null'}</div>
            <div data-testid="error">{qrGenerator.error || 'null'}</div>
          </div>
        )
      }

      render(<TestComponent />)

      const generateButton = screen.getByRole('button', { name: 'Generate QR' })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('is-open')).toHaveTextContent('true')
        expect(screen.getByTestId('qr-url')).toHaveTextContent('data:image/png;base64,mock-qr-code')
        expect(screen.getByTestId('error')).toHaveTextContent('null')
      })
    })

    it('should handle QR generation errors', async () => {
      // Mock QRCode to throw error
      const mockQRCode = require('qrcode')
      mockQRCode.toDataURL.mockRejectedValueOnce(new Error('QR generation failed'))

      const TestComponent = () => {
        const qrGenerator = useQRCodeGenerator()

        const handleGenerate = () => {
          const qrData = createCredentialQR('cred-123', 'Test Credential')
          qrGenerator.generateQRCode(qrData)
        }

        return (
          <div>
            <button onClick={handleGenerate}>Generate QR</button>
            <div data-testid="is-open">{qrGenerator.isOpen.toString()}</div>
            <div data-testid="error">{qrGenerator.error || 'null'}</div>
          </div>
        )
      }

      render(<TestComponent />)

      const generateButton = screen.getByRole('button', { name: 'Generate QR' })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('is-open')).toHaveTextContent('false')
        expect(screen.getByTestId('error')).toHaveTextContent('QR generation failed')
      })
    })

    it('should close QR code modal', () => {
      const TestComponent = () => {
        const qrGenerator = useQRCodeGenerator()

        const handleGenerate = () => {
          const qrData = createCredentialQR('cred-123', 'Test Credential')
          qrGenerator.generateQRCode(qrData)
        }

        const handleClose = () => {
          qrGenerator.closeQRCode()
        }

        return (
          <div>
            <button onClick={handleGenerate}>Generate QR</button>
            <button onClick={handleClose}>Close QR</button>
            <div data-testid="is-open">{qrGenerator.isOpen.toString()}</div>
          </div>
        )
      }

      render(<TestComponent />)

      // Generate QR first
      const generateButton = screen.getByRole('button', { name: 'Generate QR' })
      fireEvent.click(generateButton)

      expect(screen.getByTestId('is-open')).toHaveTextContent('true')

      // Close QR
      const closeButton = screen.getByRole('button', { name: 'Close QR' })
      fireEvent.click(closeButton)

      expect(screen.getByTestId('is-open')).toHaveTextContent('false')
    })
  })

  describe('QRCodeGenerator Component', () => {
    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      data: {
        type: 'credential' as const,
        id: 'cred-123',
        name: 'Test Credential',
        description: 'Test description',
        timestamp: '2024-01-01T00:00:00Z',
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should render QR code modal when open', () => {
      render(<QRCodeGenerator {...mockProps} />)

      expect(screen.getByText('QR Code')).toBeInTheDocument()
      expect(screen.getByText('Test Credential')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByAltText('QR Code for Test Credential')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<QRCodeGenerator {...mockProps} isOpen={false} />)

      expect(screen.queryByText('QR Code')).not.toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      render(<QRCodeGenerator {...mockProps} />)

      const closeButton = screen.getByRole('button', { name: '×' })
      fireEvent.click(closeButton)

      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when clicking outside modal', () => {
      render(<QRCodeGenerator {...mockProps} />)

      // Click on backdrop (outside modal content)
      const backdrop = screen.getByTestId('qr-modal-backdrop')
      fireEvent.click(backdrop)

      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should prevent backdrop click when clicking modal content', () => {
      render(<QRCodeGenerator {...mockProps} />)

      // Click on modal content (should not close)
      const modalContent = screen.getByTestId('qr-modal-content')
      fireEvent.click(modalContent)

      expect(mockProps.onClose).not.toHaveBeenCalled()
    })

    it('should display download button', () => {
      render(<QRCodeGenerator {...mockProps} />)

      const downloadButton = screen.getByRole('button', { name: 'Download QR Code' })
      expect(downloadButton).toBeInTheDocument()
    })

    it('should handle download functionality', () => {
      // Mock URL.createObjectURL and download
      const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
      const mockRevokeObjectURL = jest.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      render(<QRCodeGenerator {...mockProps} />)

      const downloadButton = screen.getByRole('button', { name: 'Download QR Code' })
      fireEvent.click(downloadButton)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should display different titles for different QR types', () => {
      const connectionProps = {
        ...mockProps,
        data: {
          ...mockProps.data,
          type: 'connection' as const,
          did: 'did:web:alice.com',
        },
      }

      const { rerender } = render(<QRCodeGenerator {...mockProps} />)
      expect(screen.getByText('QR Code')).toBeInTheDocument()

      rerender(<QRCodeGenerator {...connectionProps} />)
      expect(screen.getByText('Connection QR Code')).toBeInTheDocument()
    })

    it('should display timestamp', () => {
      render(<QRCodeGenerator {...mockProps} />)

      expect(screen.getByText(/Generated:/)).toBeInTheDocument()
      expect(screen.getByText('1/1/2024, 12:00:00 AM')).toBeInTheDocument()
    })

    it('should handle missing QR URL', () => {
      const propsWithoutUrl = {
        ...mockProps,
        data: {
          ...mockProps.data,
          qrUrl: undefined,
        },
      }

      render(<QRCodeGenerator {...propsWithoutUrl} />)

      // Should show loading state or placeholder
      expect(screen.getByText('Generating QR Code...')).toBeInTheDocument()
    })

    it('should handle invalid QR data', () => {
      const invalidProps = {
        ...mockProps,
        data: null,
      }

      // Should handle gracefully without crashing
      expect(() => render(<QRCodeGenerator {...invalidProps} />)).not.toThrow()
    })
  })
})
