import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CardSkeleton,
  CredentialCardSkeleton,
  DashboardStatsSkeleton,
  FormSkeleton,
  ListSkeleton,
  PageSkeleton,
  ProfileSkeleton,
  QRSkeleton,
  ModalSkeleton,
} from './skeleton';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: 'card' | 'credential' | 'stats' | 'form' | 'list' | 'page' | 'profile' | 'qr' | 'modal';
  skeletonProps?: any;
  className?: string;
  overlay?: boolean;
  message?: string;
}

// Skeleton component mapping
const skeletonComponents = {
  card: CardSkeleton,
  credential: CredentialCardSkeleton,
  stats: DashboardStatsSkeleton,
  form: FormSkeleton,
  list: ListSkeleton,
  page: PageSkeleton,
  profile: ProfileSkeleton,
  qr: QRSkeleton,
  modal: ModalSkeleton,
};

export function LoadingWrapper({
  isLoading,
  children,
  skeleton = 'card',
  skeletonProps = {},
  className = '',
  overlay = false,
  message = 'Loading...',
}: LoadingWrapperProps) {
  const SkeletonComponent = skeletonComponents[skeleton];

  if (!isLoading) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <SkeletonComponent {...skeletonProps} />
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({
  size = 'default',
  className = '',
  message = '',
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  message?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="text-center">
        <Loader2 className={cn('animate-spin text-indigo-600 mx-auto', sizeClasses[size])} />
        {message && (
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}

// Full page loader
export function PageLoader({
  message = 'Loading page...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Inline loader for buttons and small areas
export function InlineLoader({
  message = '',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-current" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

// Data loader with retry functionality
export function DataLoader({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage = 'Loading data...',
  errorMessage = 'Failed to load data',
  retryMessage = 'Try again',
}: {
  isLoading: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  retryMessage?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {retryMessage}
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
