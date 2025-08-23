import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the route is dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for admin authentication
    const isAuthenticated = request.cookies.get('adminAuth')?.value

    if (!isAuthenticated) {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*'
}
