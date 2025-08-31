import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { UserType, UserProfile } from '../types';
import { profileAPI, auditAPI } from '../../services';

interface UserTypeContext {
  userType: UserType;
  setUserType: (type: UserType) => void;
  isEnterprise: boolean;
  isConsumer: boolean;
  isPowerUser: boolean;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const UserTypeContext = createContext<UserTypeContext | null>(null);

export const UserTypeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userType, setUserTypeState] = useState<UserType>('consumer');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUserType = (type: UserType) => {
    setUserTypeState(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', type);
    }
  };

  const detectUserType = async (isMounted: () => boolean): Promise<UserType> => {
    try {
      // Check URL path first (only if window is available)
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/enterprise')) {
          return 'enterprise';
        }
        if (path.startsWith('/consumer')) {
          return 'consumer';
        }
      }

      // Check local storage (only if available)
      if (typeof window !== 'undefined') {
        const storedType = localStorage.getItem('userType') as UserType;
        if (storedType && ['consumer', 'enterprise', 'power-user'].includes(storedType)) {
          return storedType;
        }
      }

      // Check user profile and behavior
      try {
        const userProfile = await profileAPI.getProfile();

        if (userProfile && isMounted()) {
          // Only update profile if component is still mounted
          // This prevents state updates on unmounted components
          setProfile(userProfile);

          // Check organization affiliation
          if (userProfile.organization) {
            return 'enterprise';
          }

          // Check usage patterns (this would come from analytics)
          try {
            const usagePatterns = await getUsagePatterns(userProfile.id);

            if (usagePatterns.enterpriseFeatures > 0.7) {
              return 'enterprise';
            }

            if (usagePatterns.advancedFeatures > 0.5) {
              return 'power-user';
            }
          } catch (usageError) {
            console.warn('Failed to get usage patterns:', usageError);
          }
        }
      } catch (profileError) {
        console.warn('Failed to get user profile:', profileError);
      }

      return 'consumer';
    } catch (err) {
      console.warn('Error detecting user type:', err);
      return 'consumer';
    }
  };

  const getUsagePatterns = async (userId: string) => {
    // This would integrate with your analytics service
    // For now, return mock data based on user profile
    try {
      // Note: This assumes auditAPI has a method to get user activity
      // If not available, we'll return default values
      let auditLogs: any[] = [];
      try {
        if (auditAPI.getUserActivity && typeof auditAPI.getUserActivity === 'function') {
          auditLogs = await auditAPI.getUserActivity(userId, 100);
        }
      } catch (error) {
        console.warn('Failed to get user activity logs:', error);
        auditLogs = [];
      }

      const totalLogs = auditLogs.length;
      const enterpriseFeatures = totalLogs > 0 ? auditLogs.filter(log =>
        ['bulk.verify', 'compliance.report', 'system.monitor'].includes(log.action)
      ).length / totalLogs : 0;

      const advancedFeatures = totalLogs > 0 ? auditLogs.filter(log =>
        ['selective.disclosure', 'zkp.generate', 'multi.did'].includes(log.action)
      ).length / totalLogs : 0;

      return {
        enterpriseFeatures,
        advancedFeatures,
        totalActions: auditLogs.length,
        lastActivity: auditLogs[0]?.timestamp || null
      };
    } catch (error) {
      console.warn('Failed to analyze usage patterns:', error);
      return {
        enterpriseFeatures: 0,
        advancedFeatures: 0,
        totalActions: 0,
        lastActivity: null
      };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeUserType = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const detectedType = await detectUserType(() => isMounted);
        if (isMounted) {
          setUserTypeState(detectedType);
          localStorage.setItem('userType', detectedType);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to detect user type');
          setUserTypeState('consumer'); // fallback
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeUserType();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue: UserTypeContext = {
    userType,
    setUserType,
    isEnterprise: userType === 'enterprise',
    isConsumer: userType === 'consumer',
    isPowerUser: userType === 'power-user',
    profile,
    isLoading,
    error
  };

  return (
    <UserTypeContext.Provider value={contextValue}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = (): UserTypeContext => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};

// Hook for programmatic user type switching
export const useUserTypeSwitcher = () => {
  const { userType, setUserType } = useUserType();
  const router = useRouter();

  const switchToEnterprise = () => {
    setUserType('enterprise');
    router.push('/enterprise/dashboard');
  };

  const switchToConsumer = () => {
    setUserType('consumer');
    router.push('/consumer/dashboard');
  };

  const switchToPowerUser = () => {
    setUserType('power-user');
    router.push('/consumer/dashboard');
  };

  return {
    userType,
    switchToEnterprise,
    switchToConsumer,
    switchToPowerUser,
    canSwitchToEnterprise: userType !== 'enterprise',
    canSwitchToConsumer: userType !== 'consumer',
    canSwitchToPowerUser: userType !== 'power-user'
  };
};

// Hook for conditional rendering based on user type
export const useUserTypeGuard = (allowedTypes: UserType[]) => {
  const { userType, isLoading } = useUserType();

  return {
    isAllowed: allowedTypes.includes(userType),
    isLoading,
    userType
  };
};

// Hook for user type-specific features
export const useUserTypeFeatures = () => {
  const { userType } = useUserType();

  const features = {
    canUseBulkOperations: userType === 'enterprise',
    canAccessAdvancedAnalytics: userType === 'enterprise' || userType === 'power-user',
    canUseSelectiveDisclosure: userType !== 'consumer' || userType === 'power-user',
    canAccessAuditLogs: userType === 'enterprise',
    canUseComplianceReporting: userType === 'enterprise',
    canAccessEnterprisePortal: userType === 'enterprise',
    canUseMobileApp: userType === 'consumer' || userType === 'power-user',
    canUseBiometricAuth: true, // Available to all
    canUseZeroKnowledgeProofs: userType === 'enterprise' || userType === 'power-user',
    canAccessDeveloperTools: userType === 'enterprise' || userType === 'power-user'
  };

  return features;
};


