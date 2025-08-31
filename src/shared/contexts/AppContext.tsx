import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, LoadingState, ErrorState, DeviceType } from '../types';

interface AppContextType {
  config: AppConfig;
  loading: LoadingState;
  error: ErrorState;
  deviceType: DeviceType;
  isOnline: boolean;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  language: string;
  setLanguage: (language: string) => void;
  resetError: () => void;
  setLoading: (loading: Partial<LoadingState>) => void;
  setError: (error: Partial<ErrorState>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
  config: AppConfig;
}

const defaultConfig: AppConfig = {
  environment: 'development',
  version: '1.0.0',
  buildNumber: '1',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retryAttempts: 3
  },
  blockchain: {
    network: 'mainnet',
    rpcUrl: '',
    chainId: 1
  },
  features: {
    handshake: true,
    selectiveDisclosure: true,
    zeroKnowledgeProofs: false,
    biometricAuth: true,
    enterprisePortal: true,
    consumerMobileApp: true,
    aiRiskAssessment: false,
    multiTenant: true,
    auditLogging: true,
    complianceReporting: true
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxCredentials: 1000,
    maxRequestsPerMinute: 100
  }
};

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  config = defaultConfig
}) => {
  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  // Language state
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  // Loading state
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
    progress: undefined
  });

  // Error state
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: undefined,
    retry: undefined
  });

  // Device type detection
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  // Online status
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Theme setter with localStorage persistence
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Apply theme to document
    const root = document.documentElement;
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  // Language setter with localStorage persistence
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Loading state setter
  const setLoading = (newLoading: Partial<LoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...newLoading }));
  };

  // Error state setter
  const setError = (newError: Partial<ErrorState>) => {
    setErrorState(prev => ({ ...prev, ...newError }));
  };

  // Reset error state
  const resetError = () => {
    setErrorState({
      hasError: false,
      error: undefined,
      retry: undefined
    });
  };

  // Device type detection
  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDeviceType();
    window.addEventListener('resize', detectDeviceType);
    return () => window.removeEventListener('resize', detectDeviceType);
  }, []);

  // Online status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply initial theme
  useEffect(() => {
    setTheme(theme);
  }, []);

  // System theme change listener
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      handleChange(); // Initial check

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const contextValue: AppContextType = {
    config,
    loading,
    error,
    deviceType,
    isOnline,
    theme,
    setTheme,
    language,
    setLanguage,
    resetError,
    setLoading,
    setError
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Convenience hooks
export const useTheme = () => {
  const { theme, setTheme } = useApp();
  return { theme, setTheme };
};

export const useLanguage = () => {
  const { language, setLanguage } = useApp();
  return { language, setLanguage };
};

export const useLoading = () => {
  const { loading, setLoading } = useApp();
  return { loading, setLoading };
};

export const useError = () => {
  const { error, setError, resetError } = useApp();
  return { error, setError, resetError };
};

export const useDeviceType = () => {
  const { deviceType } = useApp();
  return deviceType;
};

export const useOnlineStatus = () => {
  const { isOnline } = useApp();
  return isOnline;
};

export const useConfig = () => {
  const { config } = useApp();
  return config;
};

// HOC for error boundary
export const withAppProvider = <P extends object>(
  Component: React.ComponentType<P>,
  appConfig?: Partial<AppConfig>
) => {
  return (props: P) => (
    <AppProvider config={{ ...defaultConfig, ...appConfig }}>
      <Component {...props} />
    </AppProvider>
  );
};
