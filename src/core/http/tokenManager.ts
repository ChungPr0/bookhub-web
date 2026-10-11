/**
 * Token Manager for BookHub Client
 * - Access Token: In-memory for XSS protection
 * - Refresh Token: LocalStorage / Cookie
 */

const REFRESH_TOKEN_KEY = 'bookhub_refresh_token';

let memoryAccessToken: string | null = null;

export const tokenManager = {
  getAccessToken: (): string | null => {
    return memoryAccessToken;
  },

  setAccessToken: (token: string | null): void => {
    memoryAccessToken = token;
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string | null): void => {
    try {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },

  clearTokens: (): void => {
    tokenManager.setAccessToken(null);
    tokenManager.setRefreshToken(null);
  },

  hasTokens: (): boolean => {
    return !!(memoryAccessToken || tokenManager.getRefreshToken());
  },
};

