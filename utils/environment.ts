/**
 * Utility functions for environment detection
 */

/**
 * Check if the app is running in production environment
 * @returns true if in production, false otherwise
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the app is running in development environment
 * @returns true if in development, false otherwise
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the base URL for the application
 * @returns the base URL from environment or default
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

/**
 * Check if running on Vercel (production deployment)
 * @returns true if on Vercel, false otherwise
 */
export function isVercel(): boolean {
  return !!process.env.VERCEL;
}
