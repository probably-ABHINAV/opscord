import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const publicRoutes = ["/", "/auth/login", "/auth/sign-up", "/demo", "/demo/admin", "/hidden"]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)
  
  const sessionToken = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")
  
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  
  if (sessionToken && request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
