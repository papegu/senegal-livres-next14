import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect www to apex and enforce HTTPS in production
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const isProd = process.env.NODE_ENV === 'production';

  // Canonical domain
  if (host === 'www.senegal-livres.sn') {
    const url = new URL(req.url);
    url.host = 'senegal-livres.sn';
    return NextResponse.redirect(url, 308);
  }

  // Enforce HTTPS on production if not already
  if (isProd && req.nextUrl.protocol === 'http:') {
    const url = new URL(req.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
