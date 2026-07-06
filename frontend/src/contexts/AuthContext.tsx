import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // On mount, try to restore session from stored token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      try {
        const { data } = await authService.getMe();
        setState({ user: data.user, isAuthenticated: true, isLoading: false });
      } catch {
        authService.logout();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    restoreSession();
  }, []);

  const handleAuthResponse = useCallback((data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setState({ user: data.user, isAuthenticated: true, isLoading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authService.login({ email, password });
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await authService.register({ name, email, password });
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const googleLogin = useCallback(async (token: string) => {
    const { data } = await authService.googleAuth(token);
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
