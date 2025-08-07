import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check session timeout (1 hour = 3600 seconds)
  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (lastActivity) {
      const timeSinceLastActivity = now - parseInt(lastActivity);
      if (timeSinceLastActivity > oneHour) {
        // Session expired, sign out user
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('message', 'Session expired due to inactivity');
        const response = NextResponse.redirect(url);
        response.cookies.delete('last_activity');
        return response;
      }
    }
    
    // Update last activity timestamp
    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: oneHour / 1000 // Convert to seconds
    });
  }

  // Protected routes - require authentication
  const protectedPaths = ['/dashboard', '/tasks', '/meetings', '/notulensi', '/analytics', '/attendance', '/settings'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Auth routes - redirect to dashboard if already logged in
  const authPaths = ['/auth/login', '/auth/register'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    // Redirect to login if trying to access protected route without authentication
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    // Use 302 redirect for faster navigation
    return NextResponse.redirect(url, { status: 302 });
  }

  if (isAuthPath && user) {
    // Redirect to dashboard if already logged in and trying to access auth pages
    // Check if there's a redirectTo parameter to avoid loops
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const url = request.nextUrl.clone();
    
    if (redirectTo && redirectTo !== '/dashboard' && redirectTo !== request.nextUrl.pathname) {
      url.pathname = redirectTo;
      url.searchParams.delete('redirectTo');
    } else {
      url.pathname = '/dashboard';
      url.search = ''; // Clear all search params
    }
    
    // Use 302 redirect for faster navigation
    return NextResponse.redirect(url, { status: 302 });
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};