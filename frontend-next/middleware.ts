// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    // 1. Ruter der KRÆVER login
    // Tilføj /order-success herhjemme hvis du vil være MEGET striks,
    // men jeg anbefaler at lade den være "åben" for at undgå redirect-fejl efter betaling.
    const protectedRoutes = ['/favorites', '/checkout', '/my-page', '/profile/me'];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // 2. Redirect til login hvis token mangler på beskyttede ruter
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Redirect væk fra login/register hvis man ALLEREDE er logget ind
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match alle ruter undtagen de statiske filer og API
         * Vi fjerner 'public' og tilføjer almindelige billedformater
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};