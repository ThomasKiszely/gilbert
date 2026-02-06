// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    // 1. Definition af ruter der KRÆVER login
    const protectedRoutes = ['/profile', '/favorites', '/checkout', '/my-page'];

    // Tjek om den aktuelle side er i listen over beskyttede ruter
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // 2. Hvis man prøver at tilgå noget beskyttet uden token -> Login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        // Gemmer hvor de kom fra, så vi kan sende dem tilbage efter login
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Hvis man er logget ind og prøver at gå til login/register -> Forside
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match alle ruter undtagen:
         * 1. /api (backend kald)
         * 2. /_next (Next.js interne filer)
         * 3. /static, /favicon.ico, osv.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};