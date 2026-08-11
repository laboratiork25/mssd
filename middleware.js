import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const USER_COOKIE_NAME = "mossad_token";

async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

function isPublicAdminPath(pathname) {
  return pathname === "/admin/login";
}

function isAdminProtectedPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isLegacyUserPath(pathname) {
  return (
    pathname === "/login" ||
    pathname === "/registrazione" ||
    pathname === "/profilo" ||
    pathname.startsWith("/profilo/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/media") ||
    pathname === "/favicon.ico" ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(USER_COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (isLegacyUserPath(pathname)) {
    return NextResponse.redirect(new URL("/segnalazione/nuova", request.url));
  }

  if (isAdminProtectedPath(pathname) && !isPublicAdminPath(pathname)) {
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/admin/login" && payload?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};