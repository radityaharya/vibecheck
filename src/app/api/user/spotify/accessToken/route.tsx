import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserId } from "~/utils/supabase/getUserId";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import getAccessToken from "~/utils/supabase/getAccessToken";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access_token = await getAccessToken(userId);

  return NextResponse.json({ access_token });
}
