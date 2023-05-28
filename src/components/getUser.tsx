"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getUser() {
  const supabase = createServerComponentClient({
    cookies,
  });

  const { data } = await supabase.auth.refreshSession();
  const { session, user } = data;
  return { session, user };
}
