import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RegisterUser } from "~/lib/supabase/registerUser";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

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
  return NextResponse.redirect(
    "https://radityaharya-potential-orbit-6pgpw4rpjvj299x-3000.preview.app.github.dev/"
  );
}
