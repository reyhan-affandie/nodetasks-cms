import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthToken, getAuthUser } from "@/actions/auth.actions";
import { setLang } from "@/actions/actions";
import { Locale } from "@/i18n/config";
import { checkLangService } from "@/services/services";
import { buildFeatureAccessMap, hasAnyPermission } from "@/lib/utils";

const locales = ["en", "id", "ph"];
const baseProtectedRoutes = ["dashboard", "features", "phases", "priorities", "roles", "tasks", "users"];

function isProtectedRoute(path: string) {
  const segments = path.split("/").filter(Boolean);
  const routeWithoutLocale = segments.length > 1 ? segments.slice(1).join("/") : segments[0];
  return baseProtectedRoutes.some((route) => routeWithoutLocale.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Ignore static files
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2|woff|ttf|json|pdf|csv|xls|xlsx|doc|docx)$/)) {
    return NextResponse.next();
  }

  const pathLocale = pathname.split("/")[1];

  // ✅ Step 1: If the URL contains a locale (`/en` or `/id`), ensure the cookie is set
  if (locales.includes(pathLocale)) {
    const cookieLocale = await checkLangService();

    // ✅ If the cookie is missing or incorrect, set it to match the URL locale
    if (!cookieLocale || cookieLocale !== pathLocale) {
      await setLang(pathLocale as Locale);
      return NextResponse.redirect(new URL(pathname, request.nextUrl.origin));
    }

    if (pathname === `/${pathLocale}/null`) {
      return NextResponse.next();
    }

    const token = await getAuthToken();
    const user = await getAuthUser();
    if (user) {
      const featureMap = buildFeatureAccessMap(user?.data);

      // Determine the first path segment after locale
      const segments = pathname.split("/").filter(Boolean); // e.g., ["en", "roles", "1"]
      const featureKey = segments[1]; // "roles", "users", "cctvs", etc.

      const featureAccess = featureMap[featureKey];

      // If trying to access a protected route but has no privileges at all → redirect to forbidden
      if (isProtectedRoute(pathname) && !hasAnyPermission(featureAccess)) {
        return NextResponse.redirect(new URL(`/${pathLocale}/forbidden`, request.url));
      }
    }

    // ✅ Step 2: If user is logged in and visits `/en` or `/id`, redirect to dashboard
    if (token && pathname.match(/^\/(en|id)\/?$/)) {
      return NextResponse.redirect(new URL(`/${pathLocale}/dashboard`, request.url));
    }

    // ✅ Step 3: If user is NOT logged in and tries to access protected routes, redirect to home
    if (!token && isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(`/${pathLocale}`, request.url));
    }

    return NextResponse.next(); // Continue normally
  }

  // ✅ Step 4: No locale in the URL, determine the correct locale
  const cookieLocale = await checkLangService();
  const finalLocale = cookieLocale || "en"; // Default to "en" if no cookie exists

  // ✅ Step 5: Set cookie if not found
  if (!cookieLocale) {
    await setLang(finalLocale as Locale);
  }

  // ✅ Step 6: Redirect to `/{locale}{pathname}` (e.g., `/en/users`)
  return NextResponse.redirect(new URL(`/${finalLocale}${pathname}`, request.url));
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|service-worker.js).*)",
};
