import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for token in cookie (primary method for page navigation)
  const tokenCookie = request.cookies.get('sanctum_token')?.value
  
  // Also check Authorization header (for API calls)
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ') 
    ? authHeader.replace('Bearer ', '') 
    : null
  
  const token = tokenCookie || tokenFromHeader

  // Check if the route is a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    // Add a message parameter to show why redirect happened
    loginUrl.searchParams.set('message', 'Please login to access this page')
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
