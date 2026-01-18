/**
 * Authentication Utilities
 *
 * Provides helper functions for token management, validation, and authentication checks.
 */

const TOKEN_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';

/**
 * Set authentication token in localStorage
 *
 * @param token - JWT token from backend
 * @param expiryDate - Optional expiry date string (ISO format)
 */
export function setAuthToken(token: string, expiryDate?: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEY, token);

  if (expiryDate) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate);
  }

  console.log("✅ Admin token set successfully");
}

/**
 * Get authentication token from localStorage
 *
 * @returns Token string or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token from localStorage and cookies
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);

  // Clear cookie (set expiry to past date)
  document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  console.log("🗑️ Admin token cleared from localStorage and cookies");
}

/**
 * Check if user is authenticated (has valid token)
 *
 * @returns true if authenticated with valid token, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return false;
  }

  // Check expiry if exists
  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (tokenExpiry) {
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();

    if (now >= expiryDate) {
      // Token expired, clear it
      clearAuthToken();
      return false;
    }
  }

  return true;
}

/**
 * Get token expiry date
 *
 * @returns Date object or null if not set
 */
export function getTokenExpiry(): Date | null {
  if (typeof window === 'undefined') return null;

  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!tokenExpiry) {
    return null;
  }

  return new Date(tokenExpiry);
}

/**
 * Check if token is expired
 *
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();

  if (!expiry) {
    // No expiry set, assume token is valid
    return false;
  }

  return new Date() >= expiry;
}

/**
 * Logout user by clearing token and redirecting
 *
 * @param redirectUrl - Optional redirect URL (defaults to /admin/login)
 */
export function logout(redirectUrl: string = '/admin/login'): void {
  clearAuthToken();

  if (typeof window !== 'undefined') {
    window.location.href = redirectUrl;
  }
}
