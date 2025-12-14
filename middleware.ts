import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect www to apex; avoid HTTPS enforcement to prevent loops behind proxies
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  // Canonical domain: redirect www → apex
  if (host === 'www.senegal-livres.sn') {
    const url = new URL(req.url);
    url.host = 'senegal-livres.sn';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
