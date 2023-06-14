import { prisma } from "~/lib/prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { slug: string };
  }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const slug = params.slug;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id as string;

  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const roomSlug = slug;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roomId: roomSlug,
    },
  });
}
