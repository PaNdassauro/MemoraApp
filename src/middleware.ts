import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    // Protected routes
    const isDashboardRoute = pathname.startsWith('/folders') ||
        pathname.startsWith('/weddings') ||
        pathname === '/'

    if (isDashboardRoute && !session) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect to home if already logged in and trying to access login page
    if (session && pathname === '/login') {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return res
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
}
