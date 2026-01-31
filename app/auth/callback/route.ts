// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Callback route para autenticación de Supabase
 * Maneja el código de autenticación después de signup/signin
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the next URL or home
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Redirect to error page or home if something went wrong
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
}
