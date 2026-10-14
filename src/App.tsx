import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AppRoutes } from './app/routes/AppRoutes';
import { useAuthStore } from './modules/auth/store/useAuthStore';
import { authApi } from './modules/auth/api/authApi';
import { tokenManager } from './core/http/tokenManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: (failureCount, error: unknown) => {
        // Do not retry 401, 403, 404
        const err = error as { status?: number };
        if (err?.status === 401 || err?.status === 403 || err?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  // Initialize Auth user on initial load if tokens exist
  useEffect(() => {
    if (tokenManager.hasTokens()) {
      authApi
        .getMe()
        .then((userData) => {
          setUser({
            id: userData.id,
            phone: userData.phone,
            fullName: userData.fullName,
            role: userData.role,
            permissions: userData.permissions,
          });
        })
        .catch(() => {
          logout();
        });
    }
  }, [setUser, logout]);

  // Listen to Global Interceptor Events for Silent Refresh failures
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
