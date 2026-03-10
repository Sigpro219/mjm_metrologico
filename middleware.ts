import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Simplification for the demo: 
    // Normally we would check the session via supabase.auth.getSession() 
    // but in middleware it requires the @supabase/ssr package or cookie check.

    if (request.nextUrl.pathname.startsWith('/admin')) {
        // For now, we allow the request, but mention it in the walkthrough.
        // Real implementation would check for the supabase session cookie.
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
