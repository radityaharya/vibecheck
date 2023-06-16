import { type SupabaseClient } from "@supabase/supabase-js";

export const getUserId = async (
  supabaseRouteHandlerClient: SupabaseClient
): Promise<string | false> => {
  const {
    data: { user },
  } = await supabaseRouteHandlerClient.auth.getUser();

  const userId = user?.id as string;

  return userId ?? false;
};
