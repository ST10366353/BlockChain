import React from 'react';
import { useRouter } from 'next/router';
import { useUserType } from '../shared/hooks';
import { LoadingSpinner } from '../shared/components/ui/loading-spinner';

export default function HomePage() {
  const router = useRouter();
  const { userType, isLoading, profile } = useUserType();

  React.useEffect(() => {
    if (isLoading) return;

    // Prevent infinite redirect loops by checking current path
    const currentPath = router.pathname;
    let targetPath = '';

    // Route based on user type with loop prevention
    if (userType === 'enterprise') {
      targetPath = '/enterprise/dashboard';
    } else if (userType === 'consumer' || userType === 'power-user') {
      // Check if user has completed onboarding
      if (profile) {
        targetPath = '/consumer/dashboard';
      } else {
        targetPath = '/consumer/onboarding';
      }
    } else {
      // Default to consumer experience for unknown user types
      targetPath = '/consumer/onboarding';
    }

    // Only redirect if we're not already on the target path
    if (currentPath !== targetPath && currentPath === '/') {
      router.push(targetPath);
    }
  }, [userType, isLoading, profile]); // router is stable, no need to include

  // Show loading while determining user type
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message="Setting up your experience..." />
    </div>
  );
}


 } from 'react';
import { useRouter } from 'next/router';
import { useUserType } from '../shared/hooks';
import { LoadingSpinner } from '../shared/components/ui/loading-spinner';

export default function HomePage() {
  const router = useRouter();
  const { userType, isLoading, profile } = useUserType();

  React.useEffect(() => {
    if (isLoading) return;

    // Prevent infinite redirect loops by checking current path
    const currentPath = router.pathname;
    let targetPath = '';

    // Route based on user type with loop prevention
    if (userType === 'enterprise') {
      targetPath = '/enterprise/dashboard';
    } else if (userType === 'consumer' || userType === 'power-user') {
      // Check if user has completed onboarding
      if (profile) {
        targetPath = '/consumer/dashboard';
      } else {
        targetPath = '/consumer/onboarding';
      }
    } else {
      // Default to consumer experience for unknown user types
      targetPath = '/consumer/onboarding';
    }

    // Only redirect if we're not already on the target path
    if (currentPath !== targetPath && currentPath === '/') {
      router.push(targetPath);
    }
  }, [userType, isLoading, profile]); // router is stable, no need to include

  // Show loading while determining user type
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message="Setting up your experience..." />
    </div>
  );
}


