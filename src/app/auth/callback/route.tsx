import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RegisterUser } from "~/lib/supabase/registerUser";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const baseUrl =
    (process.env.NEXT_PUBLIC_VERCEL_URL as string) || (process.env.DEV_URL as string);

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
  return NextResponse.redirect(`https://${baseUrl}`);
}
