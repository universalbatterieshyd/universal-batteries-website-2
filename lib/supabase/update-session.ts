import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const path = request.nextUrl.pathname

  const isAdminRoute = path.startsWith('/admin')
  const isAdminLogin = path === '/admin/login'
  const isQuotesRoute = path.startsWith('/quotes')
  const isQuotesLogin = path === '/quotes/login'

  let quoteProfile: {
    role: string
    can_access_cms: boolean
    is_active: boolean
  } | null = null

  if (user && (isAdminRoute || isQuotesRoute)) {
    const { data: profile } = await supabase
      .from('quote_profiles')
      .select('role, can_access_cms, is_active')
      .eq('user_id', user.sub as string)
      .maybeSingle()
    quoteProfile = profile
  }

  const hasActiveQuoteAccess = Boolean(quoteProfile?.is_active)
  // No quote profile → existing CMS staff; quote profile with can_access_cms → dual access
  const canAccessCms =
    !quoteProfile || quoteProfile.can_access_cms === true

  // ——— Website CMS (/admin) ———
  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    // Shop / sales quote-only users never enter CMS
    if (hasActiveQuoteAccess && !canAccessCms) {
      const url = request.nextUrl.clone()
      url.pathname = '/quotes'
      return NextResponse.redirect(url)
    }
  }

  if (isAdminLogin && user) {
    if (hasActiveQuoteAccess && !canAccessCms) {
      const url = request.nextUrl.clone()
      url.pathname = '/quotes'
      return NextResponse.redirect(url)
    }
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // ——— Rapid Quote Engine (/quotes) ———
  if (isQuotesRoute && !isQuotesLogin) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/quotes/login'
      return NextResponse.redirect(url)
    }
    if (!hasActiveQuoteAccess) {
      // Signed in as CMS-only — no quote seat
      const url = request.nextUrl.clone()
      url.pathname = '/quotes/login'
      url.searchParams.set('error', 'no_quote_access')
      return NextResponse.redirect(url)
    }
    if (path.startsWith('/quotes/admin') && quoteProfile?.role !== 'quote_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/quotes'
      return NextResponse.redirect(url)
    }
  }

  if (isQuotesLogin && user && hasActiveQuoteAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/quotes'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
