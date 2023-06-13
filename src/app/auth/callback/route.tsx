import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RegisterUser } from "~/lib/supabase/registerUser";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // base site url based on environment variable NEXT_PUBLIC_VERCEL_URL or DEV_URL
  const baseUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (process.env.NEXT_PUBLIC_DEV_URL as string);

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await RegisterUser(session);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${baseUrl}`);
}
