import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, User, LoginResponse } from '@/shared/types';
import { authService } from '@/lib/api';

// Initial auth state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Real API login functions
const loginWithCredentials = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Determine login method based on credentials
    if (credentials.passphrase && credentials.did && credentials.did.startsWith('did:')) {
      // DID-based login
      return await authService.loginWithDID(credentials.did);
    } else if (credentials.passphrase) {
      // Passphrase-based login
      return await authService.loginWithPassphrase(credentials);
    } else {
      throw new Error('Invalid login credentials');
    }
  } catch (error: any) {
    // Handle different error types
    if (error.response?.status === 401) {
      throw new Error('Invalid credentials');
    } else if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Login failed. Please check your connection and try again.');
    }
  }
};

const loginWithBiometric = async (credentialData?: {
  id: string;
  rawId: ArrayBuffer;
  response: {
    authenticatorData: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: string;
}): Promise<LoginResponse> => {
  try {
    return await authService.loginWithBiometric(credentialData);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Biometric authentication failed');
    }
  }
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await loginWithCredentials(credentials);

      // Store in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_refresh_token', response.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Biometric login function
  const loginBiometric = async (): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await loginWithBiometric();

      // Store in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_refresh_token', response.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate server-side session
      await authService.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('API logout failed, proceeding with local logout:', error);
    }

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');

    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('auth_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);

      // Update stored tokens
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_refresh_token', response.refreshToken);

      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: response.token });
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    loginBiometric,
    logout,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
