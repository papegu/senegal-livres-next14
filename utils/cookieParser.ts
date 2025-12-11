/**
 * Parse cookies from a cookie header string
 * @param cookieHeader The raw cookie header string
 * @returns An object with cookie names as keys and decoded values
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [key, val] = cookie.trim().split('=');
    if (key && val) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val; // fallback to raw value if decoding fails
      }
    }
  });
  
  return cookies;
}

/**
 * Extract a cookie value by name
 * @param cookieHeader The raw cookie header string
 * @param name The cookie name to extract
 * @returns The decoded cookie value or undefined
 */
export function getCookie(cookieHeader: string, name: string): string | undefined {
  const cookies = parseCookies(cookieHeader);
  return cookies[name];
}
