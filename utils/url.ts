/**
 * Utility functions for URL validation and manipulation
 */

/**
 * Check if a string is a valid HTTP/HTTPS URL
 * @param url - The string to validate
 * @returns true if the string is a valid URL with http/https protocol
 */
export function isValidHttpUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if a string is a Supabase storage URL
 * @param url - The string to check
 * @returns true if the string appears to be a Supabase storage URL
 */
export function isSupabaseUrl(url: string | undefined | null): boolean {
  if (!isValidHttpUrl(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url as string);
    return urlObj.hostname.includes('supabase.co');
  } catch {
    return false;
  }
}
