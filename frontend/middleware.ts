import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path === '/register' || 
    path === '/forgot-password'
  
  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value
  
  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', path) // Save original path for redirect after login
    return NextResponse.redirect(url)
  }
  
  // Redirect authenticated users away from auth pages
  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
