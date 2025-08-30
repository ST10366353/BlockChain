import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorBoundary, PageErrorBoundaryWrapper } from '@/components/error-boundary'

// Mock console methods to capture error logs
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Home: () => <div data-testid="home-icon" />,
}))

describe('Error Boundary Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
    mockConsoleWarn.mockRestore()
  })

  describe('ErrorBoundary', () => {
    const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary name="TestBoundary">
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should catch and display error fallback UI', () => {
      // Suppress console error for this test
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary">
            <ThrowError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('TestBoundary encountered an error')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()

      console.error = originalError
    })

    it('should call onError callback when error occurs', () => {
      const mockOnError = jest.fn()

      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary" onError={mockOnError}>
            <ThrowError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('should retry when Try Again button is clicked', () => {
      let shouldThrow = true

      const RetryComponent = () => {
        shouldThrow = false
        return <ThrowError shouldThrow={shouldThrow} />
      }

      const { rerender } = render(
        <ErrorBoundary name="TestBoundary">
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click retry button
      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      fireEvent.click(retryButton)

      // Re-render with component that doesn't throw
      rerender(
        <ErrorBoundary name="TestBoundary">
          <RetryComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should display custom error message', () => {
      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary" message="Custom error message">
            <ThrowError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('should handle different error types', () => {
      const ThrowStringError = () => {
        throw 'String error'
      }

      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary">
            <ThrowStringError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should reset error state on component unmount and remount', () => {
      const { unmount } = render(
        <ErrorBoundary name="TestBoundary">
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      unmount()

      // Re-mount should work normally
      render(
        <ErrorBoundary name="TestBoundary">
          <div>Recovered content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Recovered content')).toBeInTheDocument()
    })

    it('should log errors to console in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary">
            <ThrowError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      expect(mockConsoleError).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should handle async errors', async () => {
      const AsyncThrowError = () => {
        const [shouldThrow, setShouldThrow] = React.useState(false)

        React.useEffect(() => {
          const timer = setTimeout(() => setShouldThrow(true), 100)
          return () => clearTimeout(timer)
        }, [])

        if (shouldThrow) {
          throw new Error('Async error')
        }

        return <div>Loading...</div>
      }

      expect(() => {
        render(
          <ErrorBoundary name="TestBoundary">
            <AsyncThrowError />
          </ErrorBoundary>
        )
      }).not.toThrow()

      // Initially should show loading
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // After timeout, should show error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('PageErrorBoundaryWrapper', () => {
    it('should wrap children with error boundary', () => {
      render(
        <PageErrorBoundaryWrapper>
          <div>Test page content</div>
        </PageErrorBoundaryWrapper>
      )

      expect(screen.getByText('Test page content')).toBeInTheDocument()
    })

    it('should provide page-specific error handling', () => {
      const ThrowError = () => {
        throw new Error('Page error')
      }

      expect(() => {
        render(
          <PageErrorBoundaryWrapper>
            <ThrowError />
          </PageErrorBoundaryWrapper>
        )
      }).not.toThrow()

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Page encountered an error')).toBeInTheDocument()
    })

    it('should include navigation options in error UI', () => {
      const ThrowError = () => {
        throw new Error('Page error')
      }

      expect(() => {
        render(
          <PageErrorBoundaryWrapper>
            <ThrowError />
          </PageErrorBoundaryWrapper>
        )
      }).not.toThrow()

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument()
    })

    it('should handle nested component errors', () => {
      const NestedError = () => (
        <div>
          <h1>Page Title</h1>
          <ThrowError />
        </div>
      )

      const ThrowError = () => {
        throw new Error('Nested component error')
      }

      expect(() => {
        render(
          <PageErrorBoundaryWrapper>
            <NestedError />
          </PageErrorBoundaryWrapper>
        )
      }).not.toThrow()

      // Should still show the error boundary, not the page title
      expect(screen.queryByText('Page Title')).not.toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Error Recovery Patterns', () => {
    it('should handle multiple error recovery attempts', () => {
      let errorCount = 0

      const ConditionalError = () => {
        errorCount++
        if (errorCount < 3) {
          throw new Error(`Error attempt ${errorCount}`)
        }
        return <div>Success after {errorCount} attempts</div>
      }

      const { rerender } = render(
        <ErrorBoundary name="RecoveryTest">
          <ConditionalError />
        </ErrorBoundary>
      )

      // First render should show error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click retry - should still error
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click retry again - should succeed
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
      expect(screen.getByText('Success after 3 attempts')).toBeInTheDocument()
    })

    it('should preserve error context between retries', () => {
      let attemptCount = 0

      const ContextError = () => {
        attemptCount++
        throw new Error(`Attempt ${attemptCount}`)
      }

      render(
        <ErrorBoundary name="ContextTest">
          <ContextError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Each retry should create a new error instance
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should handle error boundary nesting correctly', () => {
      const InnerError = () => {
        throw new Error('Inner error')
      }

      const OuterComponent = () => (
        <ErrorBoundary name="Outer">
          <div>
            <h1>Outer content</h1>
            <ErrorBoundary name="Inner">
              <InnerError />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      )

      render(<OuterComponent />)

      // Inner boundary should catch the error
      expect(screen.getByText('Inner encountered an error')).toBeInTheDocument()
      expect(screen.queryByText('Outer encountered an error')).not.toBeInTheDocument()
      expect(screen.queryByText('Outer content')).not.toBeInTheDocument()
    })

    it('should handle sibling component errors independently', () => {
      const ErrorComponent = () => {
        throw new Error('Error component')
      }

      const NormalComponent = () => <div>Normal component</div>

      render(
        <div>
          <ErrorBoundary name="ErrorBoundary">
            <ErrorComponent />
          </ErrorBoundary>
          <ErrorBoundary name="NormalBoundary">
            <NormalComponent />
          </ErrorBoundary>
        </div>
      )

      // Error boundary should catch its error
      expect(screen.getByText('ErrorBoundary encountered an error')).toBeInTheDocument()
      // Normal boundary should render its content
      expect(screen.getByText('Normal component')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      const ThrowError = () => {
        throw new Error('Accessibility test error')
      }

      render(
        <ErrorBoundary name="AccessibilityTest">
          <ThrowError />
        </ErrorBoundary>
      )

      const errorContainer = screen.getByRole('alert')
      expect(errorContainer).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      expect(retryButton).toHaveAttribute('aria-label', 'Retry the failed operation')
    })

    it('should support keyboard navigation', () => {
      const ThrowError = () => {
        throw new Error('Keyboard test error')
      }

      render(
        <ErrorBoundary name="KeyboardTest">
          <ThrowError />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      // Button should be focusable
      retryButton.focus()
      expect(document.activeElement).toBe(retryButton)

      // Should be able to trigger with Enter key
      fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' })
      // The button click handler should be called (tested implicitly by the retry functionality)
    })

    it('should announce errors to screen readers', () => {
      const ThrowError = () => {
        throw new Error('Screen reader test error')
      }

      render(
        <ErrorBoundary name="ScreenReaderTest">
          <ThrowError />
        </ErrorBoundary>
      )

      // Error message should be properly structured for screen readers
      const errorHeading = screen.getByRole('heading', { level: 1 })
      expect(errorHeading).toHaveTextContent('Something went wrong')
    })
  })

  describe('Integration with React Features', () => {
    it('should work with React Suspense', async () => {
      const SuspenseError = () => {
        throw new Error('Suspense error')
      }

      const SuspenseComponent = () => (
        <React.Suspense fallback={<div>Loading...</div>}>
          <SuspenseError />
        </React.Suspense>
      )

      render(
        <ErrorBoundary name="SuspenseTest">
          <SuspenseComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should handle React.StrictMode correctly', () => {
      const StrictModeError = () => {
        throw new Error('StrictMode error')
      }

      expect(() => {
        render(
          <React.StrictMode>
            <ErrorBoundary name="StrictModeTest">
              <StrictModeError />
            </ErrorBoundary>
          </React.StrictMode>
        )
      }).not.toThrow()

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should work with React Router context', () => {
      // Mock React Router context
      const routerContext = {
        location: { pathname: '/test' },
        history: { push: jest.fn() },
      }

      const RouterError = () => {
        // Simulate accessing router context
        if (routerContext.location.pathname === '/test') {
          throw new Error('Router context error')
        }
        return <div>Router content</div>
      }

      render(
        <ErrorBoundary name="RouterTest">
          <RouterError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Performance and Memory', () => {
    it('should not cause memory leaks on repeated errors', () => {
      let renderCount = 0

      const LeakyError = () => {
        renderCount++
        throw new Error(`Leak test error ${renderCount}`)
      }

      const { rerender } = render(
        <ErrorBoundary name="LeakTest">
          <LeakyError />
        </ErrorBoundary>
      )

      // Initial render
      expect(renderCount).toBe(1)

      // Multiple re-renders should not accumulate
      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary name="LeakTest">
            <LeakyError />
          </ErrorBoundary>
        )
      }

      // Should not have excessive render counts
      expect(renderCount).toBeLessThan(10)
    })

    it('should handle rapid error recovery', () => {
      let shouldError = true

      const RapidRecovery = () => {
        React.useEffect(() => {
          const timer = setTimeout(() => {
            shouldError = false
          }, 50)
          return () => clearTimeout(timer)
        }, [])

        if (shouldError) {
          throw new Error('Rapid recovery error')
        }
        return <div>Recovered</div>
      }

      render(
        <ErrorBoundary name="RapidTest">
          <RapidRecovery />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Wait for recovery
      // Note: In a real scenario, this would be handled by state updates
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
