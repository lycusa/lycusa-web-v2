import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow only the main page and necessary assets/api routes
  const allowedPaths = ['/', '/_next', '/favicon.ico', '/api']

  const isAllowed = allowedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
