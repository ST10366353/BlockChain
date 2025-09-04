import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserType } from '../shared/hooks';

export default function HomePage() {
  const router = useRouter();
  const { userType, isLoading, profile } = useUserType();

  useEffect(() => {
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

  // Simple inline loading UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-3 text-gray-600">
        <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>Setting up your experience...</span>
      </div>
    </div>
  );
}


