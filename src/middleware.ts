import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { log } from "next-axiom";

export default function middleware(request: NextRequest) {
  log.info(
    JSON.stringify(
      {
        method: request.method,
        url: request.nextUrl.pathname,
        body: request.body,
      },
      null,
      2
    )
  );
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
