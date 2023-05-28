import { NextResponse, type NextRequest } from "next/server";
import { log } from "next-axiom";

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  log.info(
    JSON.stringify(
      {
        method: req.method,
        url: req.nextUrl.pathname,
        body: req.body,
      },
      null,
      2
    )
  );
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}
