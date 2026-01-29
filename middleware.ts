import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for token in cookie or Authorization header
  const token = request.cookies.get('sanctum_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if the route is a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing login/register while authenticated, redirect to dashboard
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register')
  
  if (isAuthRoute && token) {
    // Try to determine user type from token or default to farmer
    // For now, redirect to farmer dashboard - can be enhanced later
    return NextResponse.redirect(new URL('/dashboard/farmer', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
