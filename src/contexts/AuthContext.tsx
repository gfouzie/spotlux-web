'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, type LoginCredentials } from '@/api/auth';
import { setTokenProvider } from '@/api/client';

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOGIN_SUCCESS'; accessToken: string; refreshToken: string }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESH'; accessToken: string; refreshToken: string };

// Auth context interface - flattened for clean destructuring
interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  isLoading: true, // Start with loading to check for existing auth
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      };
    case 'TOKEN_REFRESH':
      return {
        ...state,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  setTokenProvider(() => state.accessToken);

  // Set tokens (access token in memory, refresh token persisted to localStorage)
  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    dispatch({ type: 'LOGIN_SUCCESS', accessToken, refreshToken });
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await authApi.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error; // Re-throw for component handling
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Auto-refresh token on mount (if refresh token exists in localStorage)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get refresh token from localStorage
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          const response = await authApi.refresh(storedRefreshToken);
          dispatch({
            type: 'TOKEN_REFRESH',
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } else {
          // No refresh token, user is not authenticated
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Invalid or expired refresh token
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Store refresh token in localStorage when it changes
  useEffect(() => {
    if (state.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [state.refreshToken]);

  // Auto-refresh token before expiration (every 25 minutes)
  useEffect(() => {
    if (!state.isAuthenticated || !state.refreshToken) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          const response = await authApi.refresh(state.refreshToken!);
          dispatch({
            type: 'TOKEN_REFRESH',
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch({ type: 'LOGOUT' });
        }
      },
      25 * 60 * 1000
    ); // 25 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, state.refreshToken]);

  const value: AuthContextType = {
    // Flatten state for clean destructuring in components
    isAuthenticated: state.isAuthenticated,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
