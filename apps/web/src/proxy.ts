import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Host-based routing for the restaurant ecosystem.
 *
 * When a request arrives on a custom domain (e.g. `reservations.chezawa.com`)
 * or a platform subdomain (`chez-awa.ndaw-resto.com`) rather than the main
 * app host, we resolve which restaurant owns that host via the API and
 * transparently rewrite the request to that restaurant's microsite
 * (`/site/<slug>`). The main marketing/app host is left untouched.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
// The platform's own host (bare domain). Subdomains of it map to restaurants.
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "localhost";

function isPlatformHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === APP_HOST ||
    host === `www.${APP_HOST}` ||
    host.endsWith(".vercel.app")
  );
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // Main app / marketing host → serve the app as-is.
  if (!host || isPlatformHost(host)) {
    return NextResponse.next();
  }

  // Custom domain or platform subdomain → find the owning restaurant.
  try {
    const res = await fetch(`${API_URL}/sites/resolve?domain=${encodeURIComponent(host)}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const { slug } = (await res.json()) as { slug?: string };
      if (slug) {
        const url = request.nextUrl.clone();
        url.pathname = `/site/${slug}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // On resolver failure, fall through and let the app render normally.
  }

  return NextResponse.next();
}

export const config = {
  // Run on page requests only — skip Next internals and static assets.
  matcher: ["/((?!_next/|favicon.ico|.*\\.[^/]+$).*)"],
};
